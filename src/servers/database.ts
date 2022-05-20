/* This is free and unencumbered software released into the public domain. */

import { SkeletonServer } from './skeleton.js';

import { Bus } from '../bus.js';
import { pg, sql } from '../database.js';
import {
  InvalidAddress,
  InvalidArguments,
  RevertError,
  TransactionError,
  UnexpectedError,
  UnknownFilter,
  UnsupportedMethod,
} from '../errors.js';
import { Request } from '../request.js';
import { compileTopics } from '../topics.js';
import * as web3 from '../web3.js';

import {
  Address,
  BlockID,
  bytesToHex,
  exportJSON,
  formatU256,
  hexToBytes,
  hexToInt,
  intToHex,
} from '@aurora-is-near/engine';
import fs from 'fs';
import { getRandomBytesSync } from 'ethereum-cryptography/random.js';

import {
  parse as parseRawTransaction,
  Transaction,
} from '@ethersproject/transactions';
import { keccak256 } from 'ethereumjs-util';
//import { assert } from 'node:console';

export class DatabaseServer extends SkeletonServer {
  protected pgClient?: pg.Client;
  protected bus?: Bus;

  protected async _init(): Promise<void> {
    // Connect to the PostgreSQL database:
    const pgClient = new pg.Client(this.config.database);
    this.pgClient = pgClient;
    await pgClient.connect();

    // Connect to the NATS message broker:
    if (this.config.broker) {
      this.bus = new Bus(this.config);
    }

    // Add type parsers for relevant numeric types:
    (pgClient as any).setTypeParser(pg.types.builtins.INT8, (val: string) =>
      BigInt(val)
    );
    (pgClient as any).setTypeParser(pg.types.builtins.NUMERIC, (val: string) =>
      BigInt(val)
    );
    for (const typeName of ['blockno', 'chainid', 'u64', 'u256']) {
      const query = sql
        .select('oid')
        .from('pg_type')
        .where({ typname: typeName });
      const { rows } = await pgClient.query(query.toParams());
      if (rows.length > 0) {
        const [{ oid }] = rows;
        (pgClient as any).setTypeParser(oid, (val: string) => BigInt(val));
      }
    }
  }

  protected _query(
    query: string | /*sql.SelectStatement*/ any,
    args?: unknown[]
  ): Promise<pg.QueryResult<any>> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.pgClient!.query(
      typeof query === 'string' ? query : query.toParams(),
      args
    );
  }

  async eth_blockNumber(_request: Request): Promise<web3.Quantity> {
    return intToHex(await this._fetchCurrentBlockID());
  }

  async eth_call(
    _request: Request,
    transaction: web3.TransactionForCall,
    blockNumberOrHash?: web3.Quantity | web3.Tag | web3.Data
  ): Promise<web3.Data> {
    let blockNumber_;
    // EIP-1898 (enables the argument to be not only blockNumber, but also blockHash)
    if (typeof blockNumberOrHash === 'string') {
      if (/^0x([A-Fa-f0-9]{64})$/.test(blockNumberOrHash)) {
        // Regex reference here https://ethereum.stackexchange.com/questions/34285/what-is-the-regex-to-validate-an-ethereum-transaction-hash/34286#34286
        const block_ = await this.eth_getBlockByHash(
          _request,
          blockNumberOrHash
        );
        if (block_ === null) throw Error('Block is temporarily unavailable');
        blockNumber_ = parseBlockSpec(
          block_ ? block_['number']?.toString() : null
        );
      } else {
        blockNumber_ = parseBlockSpec(blockNumberOrHash);
      }
    }
    const from = transaction.from
      ? parseAddress(transaction.from)
      : Address.zero();
    this._enforceEOABan(from, 'eth_call');
    const to = parseAddress(transaction.to);
    this._enforceBans(to, 'eth_call');
    const value = transaction.value ? hexToInt(transaction.value) : 0;
    const data = transaction.data
      ? hexToBytes(transaction.data)
      : Buffer.alloc(0);
    return (
      await this.engine.view(from, to, value, data, {
        block: blockNumber_ !== null ? blockNumber_ : undefined,
      })
    ).match({
      ok: (result) => bytesToHex(result as Uint8Array),
      err: (message) => {
        throw new Error(message);
      },
    });
  }

  async eth_chainId(_request: Request): Promise<web3.Quantity> {
    // EIP-695
    const chainID = (await this.engine.getChainID()).unwrap();
    return intToHex(chainID);
  }

  async eth_coinbase(_request: Request): Promise<web3.Data> {
    return (await this.engine.getCoinbase()).unwrap().toString();
  }

  async eth_getBalance(
    _request: Request,
    address: web3.Data,
    blockNumber?: web3.Quantity | web3.Tag
  ): Promise<web3.Quantity> {
    const address_ = parseAddress(address);
    this._enforceBans(address_, 'eth_getBalance');
    const balance = (await this.engine.getBalance(address_)).unwrap();
    return intToHex(balance);
  }

  async eth_getBlockByHash(
    _request: Request,
    blockHash: web3.Data,
    fullObject?: boolean
  ): Promise<web3.BlockResult | null> {
    if (!blockHash.startsWith('0x')) throw new InvalidArguments();
    const blockHash_ = hexToBytes(blockHash);
    try {
      const {
        rows: [block],
      } = await this._query('SELECT * FROM eth_getBlockByHash($1) LIMIT 1', [
        blockHash_,
      ]);
      //assert(block, 'block is not null');
      block.uncles = [];
      block.transactions = await this._fetchTransactions(
        blockHash_,
        fullObject || false
      );
      return exportJSON(block);
    } catch (error) {
      if (this.config.debug) {
        console.debug('eth_getBlockByHash', error);
      }
      return null;
    }
  }

  async eth_getBlockByNumber(
    _request: Request,
    blockNumber: web3.Quantity | web3.Tag,
    fullObject?: boolean
  ): Promise<web3.BlockResult | null> {
    const blockNumber_ =
      parseBlockSpec(blockNumber) != 0
        ? parseBlockSpec(blockNumber) || (await this._fetchCurrentBlockID())
        : 0;
    try {
      const {
        rows: [block],
      } = await this._query('SELECT * FROM eth_getBlockByNumber($1) LIMIT 1', [
        blockNumber_,
      ]);
      //assert(block, 'block is not null');
      block.uncles = [];
      block.transactions = await this._fetchTransactions(
        blockNumber_ as number,
        fullObject || false
      );
      return exportJSON(block);
    } catch (error) {
      if (this.config.debug) {
        console.debug('eth_getBlockByNumber', error);
      }
      return null;
    }
  }

  async eth_getBlockTransactionCountByHash(
    _request: Request,
    blockHash: web3.Data
  ): Promise<web3.Quantity | null> {
    const blockHash_ = blockHash.startsWith('0x')
      ? hexToBytes(blockHash)
      : blockHash;
    const {
      rows: [{ result }],
    } = await this._query(
      'SELECT eth_getBlockTransactionCountByHash($1) AS result',
      [blockHash_]
    );
    return result !== null ? intToHex(result) : null;
  }

  async eth_getBlockTransactionCountByNumber(
    _request: Request,
    blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.Quantity | null> {
    const blockNumber_ =
      parseBlockSpec(blockNumber) != 0
        ? parseBlockSpec(blockNumber) || (await this._fetchCurrentBlockID())
        : 0;
    const {
      rows: [{ result }],
    } = await this._query(
      'SELECT eth_getBlockTransactionCountByNumber($1) AS result',
      [blockNumber_]
    );
    return result !== null ? intToHex(result) : null;
  }

  async eth_getCode(
    _request: Request,
    address: web3.Data,
    blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.Data> {
    const blockNumber_ = parseBlockSpec(blockNumber);
    const address_ = parseAddress(address);
    this._enforceBans(address_, 'eth_getCode');
    const code = (
      await this.engine.getCode(address_, {
        block: blockNumber_ !== null ? blockNumber_ : undefined,
      })
    ).unwrap();
    return bytesToHex(code);
  }

  async eth_getFilterChanges(
    _request: Request,
    filterID: web3.Quantity
  ): Promise<web3.LogObject[]> {
    const filterID_ = parseFilterID(filterID);
    if (filterID_.every((b) => b === 0)) {
      return [];
    }

    const {
      rows: [row],
    } = await this._query(
      `SELECT type FROM filter WHERE uuid_send(id) = $1 LIMIT 1`,
      [filterID_]
    );
    if (!row) throw new UnknownFilter(filterID);

    switch (row.type) {
      case 'block': {
        const {
          rows,
        } = await this._query(
          'SELECT * FROM eth_getFilterChanges_block($1::bytea)',
          [filterID_]
        );
        const buffers = rows.flatMap((row: Record<string, unknown>) =>
          Object.values(row)
        ) as Buffer[];
        return buffers.map(bytesToHex);
      }
      case 'event': {
        const {
          rows,
        } = await this._query(
          'SELECT * FROM eth_getFilterChanges_event($1::bytea)',
          [filterID_]
        );
        return exportJSON(rows);
      }
      case 'transaction':
      default:
        return [];
    }
  }

  async eth_getFilterLogs(
    _request: Request,
    filterID: web3.Quantity
  ): Promise<web3.LogObject[]> {
    const filterID_ = parseFilterID(filterID);
    if (filterID_.every((b) => b === 0)) {
      return [];
    }

    const {
      rows: [row],
    } = await this._query(
      `SELECT type FROM filter WHERE uuid_send(id) = $1 LIMIT 1`,
      [filterID_]
    );
    if (!row) throw new UnknownFilter(filterID);

    switch (row.type) {
      case 'block': {
        const {
          rows,
        } = await this._query(
          'SELECT * FROM eth_getFilterLogs_block($1::bytea)',
          [filterID_]
        );
        const buffers = rows.flatMap((row: Record<string, unknown>) =>
          Object.values(row)
        ) as Buffer[];
        return buffers.map(bytesToHex);
      }
      case 'event': {
        const {
          rows,
        } = await this._query(
          'SELECT * FROM eth_getFilterLogs_event($1::bytea)',
          [filterID_]
        );
        return exportJSON(rows);
      }
      case 'transaction':
      default:
        return [];
    }
  }

  async eth_getLogs(
    _request: Request,
    filter: web3.FilterOptions
  ): Promise<web3.LogObject[]> {
    const where = [];
    if (filter.blockHash !== undefined && filter.blockHash !== null) {
      // EIP-234
      where.push({ 'b.hash': hexToBytes(filter.blockHash) });
    } else {
      const fromBlock = parseBlockSpec(filter.fromBlock);
      if (fromBlock !== null) {
        where.push(sql.gte('b.id', fromBlock));
      }
      const toBlock = parseBlockSpec(filter.toBlock);
      if (toBlock !== null) {
        where.push(sql.lte('b.id', toBlock));
      }
    }
    if (filter.address) {
      const addresses = parseAddresses(filter.address).map((address) =>
        Buffer.from(address.toBytes())
      ); // TODO: handle 0x0 => NULL
      if (addresses.length > 0) {
        where.push(sql.in('e.from', addresses));
      }
    }
    if (filter.topics) {
      const clauses = compileTopics(filter.topics);
      if (clauses) {
        where.push(clauses);
      }
    }

    if (typeof filter.index === 'number') {
      where.push({ 't.index': filter.index });
    }

    const query = sql
      .select(
        'b.id AS "blockNumber"',
        'b.hash AS "blockHash"',
        't.index AS "transactionIndex"',
        't.hash AS "transactionHash"',
        'e.index AS "logIndex"',
        'e.from AS "address"',
        "string_to_array(concat('0x',encode(e.topics[1], 'hex'), ',', '0x', encode(e.topics[2], 'hex'), ',', '0x', encode(e.topics[3], 'hex'), ',', '0x', encode(e.topics[4], 'hex')), ',') AS \"topics\"",
        'coalesce(e.data, repeat(\'\\000\', 32)::bytea) AS "data"',
        '0::boolean AS "removed"'
      )
      .from('event e')
      .leftJoin('transaction t', { 'e.transaction': 't.id' })
      .leftJoin('block b', { 't.block': 'b.id' })
      .where(sql.and(...where));
    if (this.config.debug) {
      console.debug('eth_getLogs', 'query:', query.toParams());
      console.debug('eth_getLogs', 'query:', query.toString());
    }
    const { rows } = await this._query(query);
    if (this.config.debug) {
      console.debug('eth_getLogs', 'result:', rows);
    }
    return exportJSON(
      rows.map((row: Record<string, unknown>) => {
        if (row['address'] === null) {
          row['address'] = Address.zero().toString();
        }
        // remove null values
        if (Array.isArray(row['topics'])) {
          row['topics'] = row['topics'].filter((t: string) => {
            return t !== '0x';
          });
        }
        return row;
      })
    );
  }

  async eth_getStorageAt(
    _request: Request,
    address: web3.Data,
    key: web3.Quantity,
    blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.Data> {
    const address_ = parseAddress(address);
    this._enforceBans(address_, 'eth_getStorageAt');
    const result = (await this.engine.getStorageAt(address_, key)).unwrap();
    return formatU256(result);
  }

  async eth_getTransactionByBlockHashAndIndex(
    _request: Request,
    blockHash: web3.Data,
    transactionIndex: web3.Quantity
  ): Promise<web3.TransactionResult | null> {
    const [blockHash_, transactionIndex_] = [
      hexToBytes(blockHash),
      parseInt(transactionIndex),
    ];
    try {
      const {
        rows,
      } = await this._query(
        'SELECT * FROM eth_getTransactionByBlockHashAndIndex($1::hash, $2::int)',
        [blockHash_, transactionIndex_]
      );
      return !rows || !rows.length ? null : exportJSON(rows[0]);
    } catch (error) {
      if (this.config.debug) {
        console.debug('eth_getTransactionByBlockHashAndIndex', error);
      }
      return null;
    }
  }

  async eth_getTransactionByBlockNumberAndIndex(
    _request: Request,
    blockNumber: web3.Quantity | web3.Tag,
    transactionIndex: web3.Quantity
  ): Promise<web3.TransactionResult | null> {
    const blockNumber_ =
      parseBlockSpec(blockNumber) != 0
        ? parseBlockSpec(blockNumber) || (await this._fetchCurrentBlockID())
        : 0;
    const transactionIndex_ = parseInt(transactionIndex);
    try {
      const {
        rows,
      } = await this._query(
        'SELECT * FROM eth_getTransactionByBlockNumberAndIndex($1::blockno, $2::int)',
        [blockNumber_, transactionIndex_]
      );
      return !rows || !rows.length ? null : exportJSON(rows[0]);
    } catch (error) {
      if (this.config.debug) {
        console.debug('eth_getTransactionByBlockNumberAndIndex', error);
      }
      return null;
    }
  }

  async eth_getTransactionByHash(
    _request: Request,
    transactionHash: web3.Data
  ): Promise<web3.TransactionResult | null> {
    const transactionHash_ = hexToBytes(transactionHash);
    try {
      const {
        rows,
      } = await this._query('SELECT * FROM eth_getTransactionByHash($1)', [
        transactionHash_,
      ]);
      return !rows || !rows.length ? null : exportJSON(rows[0]);
    } catch (error) {
      if (this.config.debug) {
        console.debug('eth_getTransactionByHash', error);
      }
      return null;
    }
  }

  async eth_getTransactionCount(
    _request: Request,
    address: web3.Data,
    blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.Quantity> {
    const blockNumber_ = parseBlockSpec(blockNumber);
    const address_ = parseAddress(address);
    this._enforceBans(address_, 'eth_getTransactionCount');
    const nonce = (
      await this.engine.getNonce(address_, {
        block: Number.isInteger(blockNumber_)
          ? (blockNumber_ as number) + 1
          : undefined,
      })
    ).unwrap();
    return intToHex(nonce);
  }

  async eth_getTransactionReceipt(
    _request: Request,
    transactionHash: string
  ): Promise<web3.TransactionReceipt | null> {
    const transactionHash_ = hexToBytes(transactionHash);
    try {
      const {
        rows: [receipt],
      } = await this._query(
        'SELECT * FROM eth_getTransactionReceipt($1) LIMIT 1',
        [transactionHash_]
      );
      //assert(receipt, 'receipt is not null');
      receipt.logs = await this._fetchEvents(transactionHash_);
      return exportJSON(receipt);
    } catch (error) {
      if (this.config.debug) {
        console.debug('eth_getTransactionReceipt', error);
      }
      return null;
    }
  }

  async eth_getUncleCountByBlockHash(
    _request: Request,
    blockHash: web3.Data
  ): Promise<web3.Quantity | null> {
    const blockHash_ = blockHash.startsWith('0x')
      ? hexToBytes(blockHash)
      : blockHash;
    const {
      rows: [{ result }],
    } = await this._query('SELECT eth_getUncleCountByBlockHash($1) AS result', [
      blockHash_,
    ]);
    return result !== null ? intToHex(result) : null;
  }

  async eth_getUncleCountByBlockNumber(
    _request: Request,
    blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.Quantity | null> {
    const blockNumber_ =
      parseBlockSpec(blockNumber) != 0
        ? parseBlockSpec(blockNumber) || (await this._fetchCurrentBlockID())
        : 0;
    const {
      rows: [{ result }],
    } = await this._query(
      'SELECT eth_getUncleCountByBlockNumber($1) AS result',
      [blockNumber_]
    );
    return result !== null ? intToHex(result) : null;
  }

  async eth_newBlockFilter(_request: Request): Promise<web3.Quantity> {
    const {
      rows: [{ id }],
    } = await this._query('SELECT eth_newBlockFilter($1::inet) AS id', [
      '0.0.0.0', // TODO: IPv4
    ]);

    return intToHex(id.toString('hex'));
  }

  async eth_newFilter(
    _request: Request,
    filter: web3.FilterOptions
  ): Promise<web3.Quantity> {
    const fromBlock = parseBlockSpec(filter.fromBlock);
    const toBlock = parseBlockSpec(filter.toBlock);

    const addresses =
      !filter.address || !filter.address.length
        ? null
        : parseAddresses(filter.address).map((address) =>
            Buffer.from(address.toBytes())
          );
    if (addresses && addresses.length > 10) {
      // TODO: DoS
      throw new InvalidArguments();
    }

    const topics = filter.topics || null;
    if (topics && topics.length > 4) {
      throw new InvalidArguments();
    }

    const {
      rows: [{ id }],
    } = await this._query(
      'SELECT eth_newFilter($1::inet, $2::blockno, $3::blockno, $4::address[], $5::jsonb) AS id',
      [
        '0.0.0.0', // TODO: IPv4
        fromBlock,
        toBlock,
        addresses,
        topics ? JSON.stringify(topics) : null,
      ]
    );
    return intToHex(id.toString('hex'));
  }

  async eth_newPendingTransactionFilter(
    _request: Request
  ): Promise<web3.Quantity> {
    const {
      rows: [{ id }],
    } = await this._query('SELECT eth_newPendingTransactionFilter() AS id');
    return bytesToHex(id);
  }

  async eth_sendRawTransaction(
    request: any,
    transaction: web3.Data
  ): Promise<web3.Data> {
    if (!this.config.writable) {
      throw new UnsupportedMethod('eth_sendRawTransaction');
    }

    const ip = request.ip();
    const transactionBytes = Buffer.from(hexToBytes(transaction));
    const transactionHash = keccak256(transactionBytes);

    // Enforce the EOA blacklist:
    let rawTransaction: Transaction | undefined;
    try {
      rawTransaction = parseRawTransaction(transactionBytes);
      // eslint-disable-next-line no-empty
    } catch (error) {}
    if (rawTransaction?.from) {
      const sender = Address.parse(rawTransaction.from).unwrap();
      if (this._isBannedEOA(sender)) {
        this._banIP(ip, sender.toString());
        throw new UnsupportedMethod('eth_sendRawTransaction');
      }
    }

    // Enforce the CA blacklist:
    let banReason;
    if ((banReason = this._scanForCABans(transaction))) {
      this._banIP(ip, banReason);
      throw new UnsupportedMethod('eth_sendRawTransaction');
    }

    return (await this.engine.submit(transactionBytes)).match({
      ok: (wrappedSubmitResult) => {
        const result = wrappedSubmitResult.submitResult;
        // Check if an error occurred
        if (result.output().isErr()) {
          if (result.result.kind === 'LegacyExecutionResult') {
            // legacy SubmitResult just put any error message in the output bytes
            throw new RevertError(result.result.output);
          } else {
            // new versions of SubmitResult carry error information in the status
            if (result.result.status.revert) {
              throw new RevertError(
                result.result.status.revert.output as Uint8Array
              );
            } else if (result.result.status.outOfFund) {
              throw new TransactionError('Out Of Fund');
            } else if (result.result.status.outOfGas) {
              throw new TransactionError('Out Of Gas');
            } else if (result.result.status.outOfOffset) {
              throw new TransactionError('Out Of Offset');
            } else if (result.result.status.callTooDeep) {
              throw new TransactionError('Call Too Deep');
            }
          }
        }
        return wrappedSubmitResult.gasBurned || wrappedSubmitResult.tx
          ? `${bytesToHex(transactionHash)}|${JSON.stringify({
              gasBurned: wrappedSubmitResult.gasBurned,
              tx: wrappedSubmitResult.tx,
            })}`
          : bytesToHex(transactionHash);
      },
      err: (message) => {
        const sepIndex = message.lastIndexOf('|');
        const code = sepIndex > -1 ? message.substring(0, sepIndex) : message;
        if (this.config.errorLog && !code.includes('<html>')) {
          const country = request.country();
          fs.appendFileSync(
            this.config.errorLog,
            `${ip}\t${country}\t${code}\n`
          );
        }
        switch (code) {
          case 'ERR_INTRINSIC_GAS':
            throw new TransactionError('intrinsic gas too low');
          case 'ERR_INCORRECT_NONCE':
          case 'ERR_TX_RLP_DECODE':
          case 'ERR_UNKNOWN_TX_TYPE':
            if (this.bus) {
              this.bus.publishError('eth_sendRawTransaction', ip, code);
            }
            throw new TransactionError(message);
          case 'ERR_MAX_GAS': // TODO
          case 'Exceeded the maximum amount of gas allowed to burn per contract.':
            if (this.bus) {
              this.bus.publishError(
                'eth_sendRawTransaction',
                ip,
                'ERR_MAX_GAS'
              );
            }
            if (!request.hasAuthorization()) {
              this._banIP(ip, 'ERR_MAX_GAS'); // temporarily heavy ban hammer
            }
            throw new TransactionError(message);
          default: {
            if (!code.startsWith('ERR_')) {
              throw new UnexpectedError(message);
            }
            throw new TransactionError(message);
          }
        }
      },
    });
  }

  async eth_subscribe(
    _request: Request,
    _subsciptionType: web3.Data,
    _filter: any
  ): Promise<web3.Data> {
    // Skip unsupported subs
    const id = bytesToHex(getRandomBytesSync(16));
    const filter: any = {};
    if (_filter !== null && _filter !== undefined) {
      if (_filter.address !== undefined && _filter.address !== null) {
        try {
          filter.address = parseAddresses(_filter.address);
        } catch (error) {
          throw new InvalidAddress();
        }
      }
      if (_filter.topics !== undefined && _filter.topics !== null) {
        filter.topics = _filter.topics;
      }
    }

    const query = sql.insert('subscription', {
      id: id,
      sec_websocket_key: _request.websocketKey(),
      type: _subsciptionType,
      ip: _request.ip(),
      filter: JSON.stringify(filter),
    });
    await this._query(
      `${query.toString()} ON CONFLICT (sec_websocket_key, type, filter) DO UPDATE SET id = EXCLUDED.id `
    );
    return id;
  }

  async eth_uninstallFilter(
    _request: Request,
    filterID: web3.Quantity
  ): Promise<boolean> {
    const filterID_ = parseFilterID(filterID);
    if (filterID_.every((b) => b === 0)) {
      return true;
    }
    const {
      rows: [{ found }],
    } = await this._query(
      'SELECT eth_uninstallFilter($1::inet, $2::bytea) AS found',
      ['0.0.0.0', filterID_] // TODO: IPv4
    );
    return found;
  }

  async eth_unsubscribe(
    _request: Request,
    _subsciptionId: web3.Data
  ): Promise<boolean> {
    const query = sql.delete('subscription').where({ id: _subsciptionId });
    await this._query(query.toString());
    return true;
  }

  protected async _fetchCurrentBlockID(): Promise<number> {
    const {
      rows: [{ result }],
    } = await this._query('SELECT eth_blockNumber() AS result');
    return result;
  }

  protected async _fetchEvents(transactionID: Uint8Array): Promise<unknown[]> {
    const { rows } = await this._query(
      `SELECT
          b.id AS "blockNumber",
          b.hash AS "blockHash",
          t.index AS "transactionIndex",
          t.hash AS "transactionHash",
          e.index AS "logIndex",
          e.from AS "address",
          ARRAY_TO_STRING(e.topics, ';') AS "topics",
          coalesce(e.data, repeat('\\000', 32)::bytea) AS "data",
          false AS "removed"
        FROM event e
          LEFT JOIN transaction t ON e.transaction = t.id
          LEFT JOIN block b ON t.block = b.id
        WHERE t.hash = $1
        ORDER BY b.id ASC, t.index ASC, e.index ASC`,
      [transactionID]
    );
    return rows.map((row: Record<string, unknown>) => {
      row['topics'] =
        row['topics'] === null
          ? []
          : (row['topics'] as string)
              .split(';')
              .map((topic) => topic.replace('\\x', '0x'));
      return row;
    });
  }

  protected async _fetchTransactions(
    blockID: number | Uint8Array,
    fullObject: boolean
  ): Promise<unknown[] | string[]> {
    const idColumn = typeof blockID === 'number' ? 'id' : 'hash';
    if (fullObject) {
      const { rows } = await this._query(
        `SELECT
            b.id AS "blockNumber",
            b.hash AS "blockHash",
            t.index AS "transactionIndex",
            t.hash AS "hash",
            t.from AS "from",
            t.to AS "to",
            t.gas_limit AS "gas",
            t.gas_price AS "gasPrice",
            t.nonce AS "nonce",
            t.value AS "value",
            coalesce(t.input, '\\x'::bytea) AS "input",
            t.v AS "v",
            t.r AS "r",
            t.s AS "s"
          FROM transaction t
            LEFT JOIN block b ON t.block = b.id
          WHERE b.${idColumn} = $1
          ORDER BY t.index ASC`,
        [blockID]
      );
      return rows;
    } else {
      const { rows } = await this._query(
        `SELECT t.hash FROM transaction t LEFT JOIN block b ON t.block = b.id
          WHERE b.${idColumn} = $1 ORDER BY t.index ASC`,
        [blockID]
      );
      return rows.map((row: Record<string, unknown>) =>
        bytesToHex(row['hash'] as Uint8Array)
      );
    }
  }
}

function parseAddress(input?: web3.Data): Address {
  if (!input) throw new InvalidArguments();
  return Address.parse(input).unwrapOrElse((_) => {
    throw new InvalidArguments();
  });
}

function parseAddresses(inputs: web3.Data | web3.Data[]): Address[] {
  return (Array.isArray(inputs) ? inputs : [inputs]).map(parseAddress);
}

function parseBlockSpec(
  blockSpec?: web3.Quantity | web3.Tag | null
): BlockID | null {
  switch (blockSpec) {
    case undefined:
      return null;
    case null:
      return null;
    case 'pending':
      return null;
    case 'latest':
      return null;
    case 'earliest':
      return 0;
    default: {
      const blockID = parseInt(blockSpec);
      if (isNaN(blockID)) {
        throw new InvalidArguments();
      }
      return blockID;
    }
  }
}

function parseFilterID(input: web3.Quantity): Buffer {
  if (input === '0x0') {
    return Buffer.alloc(16);
  }
  const bytes = hexToBytes(input);
  if (bytes.length != 16) {
    throw new InvalidArguments();
  }
  return Buffer.from(bytes);
}
