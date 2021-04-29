/* This is free and unencumbered software released into the public domain. */

import { SkeletonServer } from './skeleton.js';

import * as api from '../api.js';
import { InvalidArguments } from '../errors.js';
import { compileTopics } from '../topics.js';

import {
  Address,
  BlockID,
  bytesToHex,
  exportJSON,
  formatU256,
  hexToBytes,
  intToHex,
} from '@aurora-is-near/engine';
import pg from 'pg';

import sql from 'sql-bricks';
const sqlConvert = (sql as any).convert;
(sql as any).convert = (val: unknown) => {
  if (val instanceof Uint8Array) {
    return `'\\x${Buffer.from(val).toString('hex')}'`;
  }
  return sqlConvert(val);
};

export class DatabaseServer extends SkeletonServer {
  protected pgClient?: pg.Client;

  protected async _init(): Promise<void> {
    const pgClient = new pg.Client(this.config.database);
    this.pgClient = pgClient;
    await pgClient.connect();

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

    // Listen to new block notifications:
    pgClient.on('notification', (message: pg.Notification) => {
      if (!message.payload) return;
      if (message.channel === 'block') {
        const blockID = parseInt(message.payload);
        if (isNaN(blockID)) return; // ignore UFOs

        this.logger.info({ block: { id: blockID } }, 'block received');

        // TODO: notify subscribers
      }
    });
    pgClient.query('LISTEN block');
  }

  protected _query(
    query: string | sql.SelectStatement,
    args?: unknown[]
  ): Promise<pg.QueryResult<any>> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.pgClient!.query(
      typeof query === 'string' ? query : query.toParams(),
      args
    );
  }

  async eth_blockNumber(): Promise<api.Quantity> {
    const {
      rows: [{ result }],
    } = await this._query('SELECT eth_blockNumber() AS result');
    return intToHex(result);
  }

  async eth_call(
    transaction: api.TransactionForCall,
    blockNumber?: api.Quantity | api.Tag
  ): Promise<api.Data> {
    return super.eth_call(transaction, blockNumber); // TODO: implement
  }

  async eth_chainId(): Promise<api.Quantity> {
    // EIP-695
    const chainID = (await this.engine.getChainID()).unwrap();
    return intToHex(chainID);
  }

  async eth_coinbase(): Promise<api.Data> {
    return (await this.engine.getCoinbase()).unwrap().toString();
  }

  async eth_getBalance(
    address: api.Data,
    blockNumber?: api.Quantity | api.Tag
  ): Promise<api.Quantity> {
    const address_ = Address.parse(address).unwrap();
    const balance = (await this.engine.getBalance(address_)).unwrap();
    return intToHex(balance);
  }

  async eth_getBlockByHash(
    blockHash: api.Data,
    fullObject?: boolean
  ): Promise<api.BlockResult | null> {
    const blockHash_ = blockHash.startsWith('0x')
      ? hexToBytes(blockHash)
      : blockHash;
    try {
      const { rows } = await this._query(
        'SELECT * FROM eth_getBlockByHash($1)',
        [blockHash_]
      );
      return exportJSON(
        rows.map((row: Record<string, unknown>) => {
          row['uncles'] = [];
          row['transactions'] = []; // TODO: fetch
          return row;
        })
      );
    } catch (error) {
      if (this.config.debug) {
        console.debug('eth_getBlockByHash', error);
      }
      return null;
    }
  }

  async eth_getBlockByNumber(
    blockNumber: api.Quantity | api.Tag,
    fullObject?: boolean
  ): Promise<api.BlockResult | null> {
    const blockNumber_ = blockNumber.startsWith('0x')
      ? parseInt(blockNumber, 16)
      : blockNumber;
    try {
      const {
        rows,
      } = await this._query('SELECT * FROM eth_getBlockByNumber($1)', [
        blockNumber_,
      ]);
      return exportJSON(
        rows.map((row: Record<string, unknown>) => {
          row['uncles'] = [];
          row['transactions'] = []; // TODO: fetch
          return row;
        })
      );
    } catch (error) {
      if (this.config.debug) {
        console.debug('eth_getBlockByNumber', error);
      }
      return null;
    }
  }

  async eth_getBlockTransactionCountByHash(
    blockHash: api.Data
  ): Promise<api.Quantity | null> {
    const blockHash_ = blockHash.startsWith('0x')
      ? hexToBytes(blockHash)
      : blockHash;
    const {
      rows: [{ result }],
    } = await this._query(
      'SELECT eth_getBlockTransactionCountByHash($1) AS result',
      [blockHash_]
    );
    return intToHex(result);
  }

  async eth_getBlockTransactionCountByNumber(
    blockNumber: api.Quantity | api.Tag
  ): Promise<api.Quantity | null> {
    const blockNumber_ = blockNumber.startsWith('0x')
      ? parseInt(blockNumber, 16)
      : blockNumber;
    const {
      rows: [{ result }],
    } = await this._query(
      'SELECT eth_getBlockTransactionCountByNumber($1) AS result',
      [blockNumber_]
    );
    return intToHex(result);
  }

  async eth_getCode(
    address: api.Data,
    _blockNumber: api.Quantity | api.Tag
  ): Promise<api.Data> {
    // TODO: honor blockNumber
    const address_ = Address.parse(address).unwrap();
    const code = (await this.engine.getCode(address_)).unwrap();
    return bytesToHex(code);
  }

  async eth_getFilterChanges(filterID: api.Quantity): Promise<api.LogObject[]> {
    const filterID_ = parseInt(filterID, 16);
    if (filterID_ === 0) {
      return [];
    }

    const {
      rows: [{ type }],
    } = await this._query(
      sql.select('type').from('filter').where({ id: filterID_ })
    );
    switch (type) {
      case 'block': {
        const {
          rows,
        } = await this._query(
          'SELECT * FROM eth_getFilterChanges_block($1::bigint)',
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
          'SELECT * FROM eth_getFilterChanges_event($1::bigint)',
          [filterID_]
        );
        return exportJSON(rows);
      }
      case 'transaction':
      default:
        return [];
    }
  }

  async eth_getFilterLogs(filterID: api.Quantity): Promise<api.LogObject[]> {
    const filterID_ = parseInt(filterID, 16);
    if (filterID_ === 0) {
      return [];
    }

    const {
      rows: [{ type }],
    } = await this._query(
      sql.select('type').from('filter').where({ id: filterID_ })
    );
    switch (type) {
      case 'block': {
        const {
          rows,
        } = await this._query(
          'SELECT * FROM eth_getFilterLogs_block($1::bigint)',
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
          'SELECT * FROM eth_getFilterLogs_event($1::bigint)',
          [filterID_]
        );
        return exportJSON(rows);
      }
      case 'transaction':
      default:
        return [];
    }
  }

  async eth_getLogs(filter: api.FilterOptions): Promise<api.LogObject[]> {
    const where = [];
    if (filter.blockHash !== undefined && filter.blockHash !== null) {
      // EIP-234
      where.push({ 'b.hash': hexToBytes(filter.blockHash) });
    } else {
      const fromBlock = parseBlockSpec(filter.fromBlock);
      if (fromBlock) {
        where.push(sql.gte('b.id', fromBlock));
      }
      const toBlock = parseBlockSpec(filter.toBlock);
      if (toBlock) {
        where.push(sql.lte('b.id', toBlock));
      }
    }
    if (filter.address) {
      const addresses = parseAddresses(filter.address).map((address) =>
        Buffer.from(address.toBytes())
      ); // TODO: handle 0x0 => NULL
      if (addresses.length > 0) {
        where.push(sql.in('t.to', addresses));
      }
    }
    if (filter.topics) {
      const clauses = compileTopics(filter.topics);
      if (clauses) {
        where.push(clauses);
      }
    }

    const query = sql
      .select(
        'b.id AS "blockNumber"',
        'b.hash AS "blockHash"',
        't.index AS "transactionIndex"',
        't.hash AS "transactionHash"',
        'e.index AS "logIndex"',
        't.to AS "address"',
        'e.topics AS "topics"',
        'e.data AS "data"',
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
        return row;
      })
    );
  }

  async eth_getStorageAt(
    address: api.Data,
    key: api.Quantity,
    blockNumber: api.Quantity | api.Tag
  ): Promise<api.Data> {
    const address_ = Address.parse(address).unwrap();
    const result = (await this.engine.getStorageAt(address_, key)).unwrap();
    return formatU256(result);
  }

  async eth_getTransactionByBlockHashAndIndex(
    blockHash: api.Data,
    transactionIndex: api.Quantity
  ): Promise<api.TransactionResult | null> {
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
    blockNumber: api.Quantity | api.Tag,
    transactionIndex: api.Quantity
  ): Promise<api.TransactionResult | null> {
    const [blockNumber_, transactionIndex_] = [
      parseInt(blockNumber),
      parseInt(transactionIndex),
    ];
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
    transactionHash: api.Data
  ): Promise<api.TransactionResult | null> {
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
    address: api.Data,
    _blockNumber: api.Quantity | api.Tag
  ): Promise<api.Quantity> {
    // TODO: honor blockNumber
    const address_ = Address.parse(address).unwrap();
    const nonce = (await this.engine.getNonce(address_)).unwrap();
    return intToHex(nonce);
  }

  async eth_getTransactionReceipt(
    transactionHash: string
  ): Promise<api.TransactionReceipt | null> {
    const transactionHash_ = hexToBytes(transactionHash);
    try {
      const {
        rows,
      } = await this._query('SELECT * FROM eth_getTransactionReceipt($1)', [
        transactionHash_,
      ]);
      return !rows || !rows.length
        ? null
        : exportJSON(
            rows.map((row: Record<string, unknown>) => {
              row['logs'] = []; // TODO: fetch
              return row;
            })[0]
          );
    } catch (error) {
      if (this.config.debug) {
        console.debug('eth_getTransactionReceipt', error);
      }
      return null;
    }
  }

  async eth_getUncleCountByBlockHash(
    blockHash: api.Data
  ): Promise<api.Quantity | null> {
    const blockHash_ = blockHash.startsWith('0x')
      ? hexToBytes(blockHash)
      : blockHash;
    const {
      rows: [{ result }],
    } = await this._query('SELECT eth_getUncleCountByBlockHash($1) AS result', [
      blockHash_,
    ]);
    return intToHex(result);
  }

  async eth_getUncleCountByBlockNumber(
    blockNumber: api.Quantity | api.Tag
  ): Promise<api.Quantity | null> {
    const blockNumber_ = blockNumber.startsWith('0x')
      ? parseInt(blockNumber, 16)
      : blockNumber;
    const {
      rows: [{ result }],
    } = await this._query(
      'SELECT eth_getUncleCountByBlockNumber($1) AS result',
      [blockNumber_]
    );
    return intToHex(result);
  }

  async eth_newBlockFilter(): Promise<api.Quantity> {
    const {
      rows: [{ id }],
    } = await this._query('SELECT eth_newBlockFilter($1::inet) AS id', [
      '0.0.0.0',
    ]); // TODO: IPv4
    return intToHex(id);
  }

  async eth_newFilter(filter: api.FilterOptions): Promise<api.Quantity> {
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
        '0.0.0.0',
        fromBlock,
        toBlock,
        addresses,
        topics ? JSON.stringify(topics) : null,
      ]
    ); // TODO: IPv4
    return intToHex(id);
  }

  async eth_newPendingTransactionFilter(): Promise<api.Quantity> {
    const {
      rows: [{ id }],
    } = await this._query('SELECT eth_newPendingTransactionFilter() AS id');
    return intToHex(id);
  }

  async eth_sendRawTransaction(transaction: api.Data): Promise<api.Data> {
    const output = (await this.engine.rawCall(transaction)).unwrap();
    return bytesToHex(output);
  }

  async eth_sendTransaction(
    transaction: api.TransactionForSend
  ): Promise<api.Data> {
    return super.eth_sendTransaction(transaction); // TODO: implement
  }

  async eth_uninstallFilter(filterID: api.Quantity): Promise<boolean> {
    const filterID_ = parseInt(filterID, 16);
    if (filterID_ === 0) {
      return true;
    }
    const {
      rows: [{ found }],
    } = await this._query(
      'SELECT eth_uninstallFilter($1::inet, $2::bigint) AS found',
      ['0.0.0.0', filterID_]
    ); // TODO: IPv4
    return found;
  }
}

function parseAddresses(input: api.Data | api.Data[]): Address[] {
  return (Array.isArray(input) ? input : [input]).map((address: string) =>
    Address.parse(address).unwrap()
  );
}

function parseBlockSpec(
  blockSpec?: api.Quantity | api.Tag | null
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
      const blockID = parseInt(blockSpec, 16);
      if (isNaN(blockID)) {
        throw new InvalidArguments();
      }
      return blockID;
    }
  }
}
