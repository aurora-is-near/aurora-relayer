/* This is free and unencumbered software released into the public domain. */

import { Config } from './config.js';
import { pg, sql } from './database.js';
import {
  computeBlockHash,
  EmptyBlock,
  generateEmptyBlock,
  emptyTransactionsRoot,
} from './utils.js';
import {
  AccountID,
  BlockHeight,
  Engine,
  hexToBytes,
  LogEventWithAddress,
  NetworkConfig,
} from '@aurora-is-near/engine';

interface PendingBlocks {
  [key: number]: string;
}

export class Indexer {
  protected readonly contractID: AccountID;
  protected readonly pgClient: pg.Client;
  protected pendingHeadBlock: number;
  protected pendingBlocks: PendingBlocks = {};

  constructor(
    public readonly config: Config,
    public readonly network: NetworkConfig,
    public readonly engine: Engine
  ) {
    this.contractID = AccountID.parse(this.config.engine).unwrap();
    this.pgClient = new pg.Client(config.database);
    this.pendingHeadBlock = 0;
    this.pendingBlocks = {};
  }

  async start(): Promise<void> {
    await this.pgClient.connect();
  }

  async blockData(blockID: BlockHeight): Promise<any> {
    for (;;) {
      const proxy = await this.engine.getBlock(blockID, {
        transactions: 'full',
        contractID: this.contractID,
      });
      if (proxy.isErr()) {
        const error = proxy.unwrapErr();
        if (error.startsWith('[-32000] Server error: DB Not Found Error')) {
          // Handling empty blocks
          const emptyBlock: EmptyBlock = generateEmptyBlock(
            blockID as number,
            this.contractID.toString(),
            this.network.chainID
          );
          //if (this.config.debug) console.debug(emptyBlock); // DEBUG
          console.error(`Indexing skipped block #${blockID}...`);
          const skippedBlockDataJson = {
            chain: emptyBlock.chain,
            id: emptyBlock.id,
            hash: sql.convert(emptyBlock.hash),
            near_hash: emptyBlock.nearHash,
            timestamp: emptyBlock.timestamp,
            size: emptyBlock.size,
            gas_limit: emptyBlock.gasLimit,
            gas_used: emptyBlock.gasUsed,
            parent_hash: sql.convert(emptyBlock.parentHash),
            transactions_root: sql.convert(emptyBlock.transactionsRoot),
            state_root: sql.convert(emptyBlock.stateRoot),
            receipts_root: sql.convert(emptyBlock.receiptsRoot),
          };
          return skippedBlockDataJson;
        }
        if (this.config.debug) console.error(error); // DEBUG
        await this.delay(200);
        continue; // retry block
      }
      const block_ = proxy.unwrap();
      const block = block_.getMetadata();
      const blockHash = computeBlockHash(
        block.number as number,
        this.contractID.toString(),
        this.network.chainID
      );
      const parentHash = computeBlockHash(
        (block.number as number) - 1,
        this.contractID.toString(),
        this.network.chainID
      );

      const transactionsRoot =
        block.transactions.length == 0
          ? emptyTransactionsRoot()
          : block.transactionsRoot;
      const transactions = await (block.transactions as any[]).map(
        async (transaction, transactionIndex) => {
          return await this.transactionData(
            blockID,
            transactionIndex,
            transaction
          );
        }
      );

      const blockData = {
        chain: this.network.chainID,
        id: block.number,
        hash: sql.convert(blockHash),
        near_hash: block_.near?.hash ? sql.convert(block_.near?.hash) : null,
        timestamp: new Date((block.timestamp as number) * 1000).toISOString(),
        size: block.size,
        gas_limit: 0, // FIXME: block.gasLimit,
        gas_used: 0, // FIXME: block.gasUsed,
        parent_hash: sql.convert(parentHash),
        transactions_root: sql.convert(transactionsRoot),
        state_root: sql.convert(block.stateRoot),
        receipts_root: sql.convert(block.receiptsRoot),
      };
      const jsonBlockData = {
        ...blockData,
        ...{ transactions: await Promise.all(transactions) },
      };
      return jsonBlockData; // finish block
    } // for (;;)
  }

  async transactionData(
    blockID: BlockHeight,
    transactionIndex: number,
    transaction: any
  ): Promise<any> {
    const to = transaction.to;
    const result = transaction.result!;

    let status;
    let output = null;
    if (typeof result?.result?.status === 'boolean') {
      status = result.result?.status;
      output = result.output;
    } else {
      status = result.result?.status.enum === 'success';
      if (result.result?.status.success?.output.length)
        output = result.result?.status.success?.output;
    }
    //if (this.config.debug) console.debug(query.toParams()); // DEBUG

    const logs = await ((transaction.result?.result?.logs || []) as any[]).map(
      async (event: any, eventIndex: any) => {
        const event_ = event as LogEventWithAddress;
        return {
          data: event_.data?.length ? sql.convert(event_.data) : null,
          from: event_.address
            ? sql.convert(Buffer.from(event_.address))
            : sql.convert(Buffer.alloc(20)),
          topics: event_.topics?.length
            ? event_.topics.map((topic) => sql.convert(topic.toBytes()))
            : null,
        };
      }
    );

    // Index all log events emitted by this transaction:
    return {
      block: blockID,
      index: transactionIndex,
      //id: null,
      hash: sql.convert(Buffer.from(hexToBytes(transaction.hash!))),
      near_hash: sql.convert(transaction.near?.hash),
      near_receipt_hash: sql.convert(transaction.near?.receiptHash),
      from: sql.convert(Buffer.from(transaction.from!.toBytes())),
      to: to?.isSome() ? sql.convert(Buffer.from(to.unwrap().toBytes())) : null,
      nonce: transaction.nonce,
      gas_price: transaction.gasPrice.toString(),
      gas_limit: transaction.gasLimit.toString(),
      gas_used: result.result?.gasUsed.toString() || '0',
      value: transaction.value.toString(),
      input: transaction.data?.length ? sql.convert(transaction.data) : null,
      v: transaction.v.toString(),
      r: transaction.r.toString(),
      s: transaction.s.toString(),
      status: status,
      output: output ? sql.convert(output) : null,
      logs: await Promise.all(logs),
    };
  }

  async toSql(blockData: any) {
    try {
      const transactions = blockData.transactions || [];
      delete blockData.transactions;
      const query = sql.insert('block', blockData).returning('id');
      const partialBlockSql = query.toString();
      const blockSql = `WITH b AS (${partialBlockSql})\n`;
      let transactionsSql = ``;
      const events = [];
      for (const [transactionIndex, transaction] of transactions.entries()) {
        const logs = transaction.logs;
        delete transaction.logs;
        const transactionData = {
          ...transaction,
          ...{ block: blockData.id, index: transactionIndex },
        };
        const query = sql
          .insert('transaction', transactionData)
          .returning('id');
        transactionsSql += `, tx${transactionIndex} AS (${query.toString()})\n`;
        for (const [eventIndex, event] of logs.entries()) {
          const topics = event.topics?.length
            ? event.topics.map((topic: any) => `'${topic}'`)
            : '';
          const data = event.data ? `'${event.data?.toString()}'` : null;
          const from = event.from ? `'${event.from?.toString()}'` : null;

          const query = sql
            .select(
              `tx${transactionIndex}.id`,
              eventIndex.toString(),
              `${data}::bytea`,
              `${from}::address`,
              `ARRAY[${topics}]::hash[]`
            )
            .from(`tx${transactionIndex}`);
          events.push(query.toString());
        }
      }
      if (events?.length > 0) {
        transactionsSql += ` INSERT INTO event (transaction, index, data, "from", topics)`;
        transactionsSql += events.join(' UNION \n');
      }
      if (events?.length == 0 || transactionsSql.length == 0) {
        transactionsSql += ` SELECT 1 \n`;
      }

      // console.log(`${blockSql} ${transactionsSql}`)
      return `${blockSql} ${transactionsSql}`;
    } catch (error) {
      console.error('Error indexing. Performing Rollback', error);
      return ''; // abort block
    }
  }

  async insert(blockData: any) {
    const sqlData = await this.toSql(blockData);
    await this.pgClient.query(sqlData);
  }

  async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async insertNewHeads(): Promise<void> {
    for (;;) {
      if (this.pendingBlocks[this.pendingHeadBlock]) {
        await this.insert(this.pendingBlocks[this.pendingHeadBlock]);
        console.error(`Indexing Head Block #${this.pendingHeadBlock}...`);
        delete this.pendingBlocks[this.pendingHeadBlock];
        this.pendingHeadBlock += 1;
      }
      await this.delay(100);
    }
  }

  async notifyNewHeads(blockID: number, blockData: any): Promise<void> {
    if (this.pendingHeadBlock == 0) {
      this.pendingHeadBlock = blockID;
    }
    this.pendingBlocks[blockID] = blockData;
  }
}
