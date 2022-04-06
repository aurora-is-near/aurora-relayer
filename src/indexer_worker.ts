/* This is free and unencumbered software released into the public domain. */

import { MessagePort, parentPort, workerData } from 'worker_threads';

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
  ConnectEnv,
  Engine,
  hexToBytes,
  LogEvent,
  LogEventWithAddress,
  NetworkConfig,
} from '@aurora-is-near/engine';

interface PendingBlocks {
  [key: number]: string;
}

interface WorkerData {
  config: Config;
  network: NetworkConfig;
  env: ConnectEnv;
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

  async indexBlock(blockID: BlockHeight): Promise<any> {
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
            hash: emptyBlock.hash,
            near_hash: emptyBlock.nearHash,
            timestamp: emptyBlock.timestamp,
            size: emptyBlock.size,
            gas_limit: emptyBlock.gasLimit,
            gas_used: emptyBlock.gasUsed,
            parent_hash: emptyBlock.parentHash,
            transactions_root: emptyBlock.transactionsRoot,
            state_root: emptyBlock.stateRoot,
            receipts_root: emptyBlock.receiptsRoot,
          };
          return skippedBlockDataJson;
        }
        if (this.config.debug) console.error(error); // DEBUG
        await this.delay(100);
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
      // console.error(`Indexing block #${blockID}...`);
      const transactions = await (block.transactions as any[]).map(
        async (transaction, transactionIndex) => {
          return await this.indexTransaction(
            blockID,
            transactionIndex,
            transaction
          );
        }
      );

      const blockData = {
        chain: this.network.chainID,
        id: block.number,
        hash: blockHash,
        near_hash: block_.near?.hash,
        timestamp: new Date((block.timestamp as number) * 1000).toISOString(),
        size: block.size,
        gas_limit: 0, // FIXME: block.gasLimit,
        gas_used: 0, // FIXME: block.gasUsed,
        parent_hash: parentHash,
        transactions_root: transactionsRoot,
        state_root: block.stateRoot,
        receipts_root: block.receiptsRoot,
      };
      const jsonBlockData = {
        ...blockData,
        ...{ transactions: await Promise.all(transactions) },
      };
      return jsonBlockData; // finish block
    } // for (;;)
  }

  async indexTransaction(
    blockID: BlockHeight,
    transactionIndex: number,
    transaction: any
  ): Promise<any> {
    console.error(
      `Indexing transaction ${transaction.hash} at #${blockID}:${transactionIndex}...`
    );

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
        return await this.indexEvent(
          blockID,
          transactionIndex,
          eventIndex,
          event
        );
      }
    );

    // Index all log events emitted by this transaction:
    return {
      block: blockID,
      index: transactionIndex,
      //id: null,
      hash: Buffer.from(hexToBytes(transaction.hash!)),
      near_hash: transaction.near?.hash,
      near_receipt_hash: transaction.near?.receiptHash,
      from: Buffer.from(transaction.from!.toBytes()),
      to: to?.isSome() ? Buffer.from(to.unwrap().toBytes()) : null,
      nonce: transaction.nonce,
      gas_price: transaction.gasPrice,
      gas_limit: transaction.gasLimit,
      gas_used: result.result?.gasUsed || '0',
      value: transaction.value,
      input: transaction.data?.length ? transaction.data : null,
      v: transaction.v,
      r: transaction.r,
      s: transaction.s,
      status: status,
      output: output,
      logs: await Promise.all(logs),
    };
  }

  async indexEvent(
    blockID: BlockHeight,
    transactionIndex: number,
    eventIndex: number,
    event: LogEventWithAddress | LogEvent
  ): Promise<any> {
    console.error(
      `Indexing log event at #${blockID}:${transactionIndex}:${eventIndex}...`
    );
    const event_ = event as LogEventWithAddress;

    return {
      //id: null,
      data: event_.data?.length ? event_.data : null,
      from: event_.address ? Buffer.from(event_.address) : Buffer.alloc(20),
      topics: event_.topics?.length
        ? event_.topics.map((topic) => topic.toBytes())
        : null,
    };
  }

  async insertNewHeads(): Promise<void> {
    for (;;) {
      if (this.pendingBlocks[this.pendingHeadBlock]) {
        await this.insert(this.pendingBlocks[this.pendingHeadBlock]);
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

  async insert(blockData: any) {
    try {
      const transactions = blockData.transactions || [];
      delete blockData.transactions;
      await this.pgClient.query('BEGIN');
      const query = sql.insert('block', blockData);
      await this.pgClient.query(query.toParams());
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
        const {
          rows: [{ id }],
        } = await this.pgClient.query(query.toParams());
        const transactionID = parseInt(id as string);
        for (const [eventIndex, event] of logs.entries()) {
          const eventData = {
            ...event,
            ...{ transaction: transactionID, index: eventIndex },
          };
          const query = sql.insert('event', eventData);
          await this.pgClient.query(query.toParams());
        }
      }
      await this.pgClient.query('COMMIT');
    } catch (error) {
      console.error('Error indexing. Performing Rollback', error);
      await this.pgClient.query('ROLLBACK');
      return; // abort block
    }
  }

  async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

async function main(parentPort: MessagePort, workerData: WorkerData) {
  const { config, network, env } = workerData;
  const engine = await Engine.connect(
    {
      network: network.id,
      endpoint: config.endpoint,
      contract: config.engine,
    },
    env
  );
  const indexer = new Indexer(config, network, engine);
  await indexer.start();

  setTimeout(function () {
    indexer.insertNewHeads();
  });

  parentPort
    .on('message', async (block: any) => {
      parentPort.postMessage(true); // ack the request
      const blockData = await indexer.indexBlock(block.id);
      if (block.is_head) {
        indexer.notifyNewHeads(block.id, blockData);
      } else {
        indexer.insert(blockData);
      }
    })
    .on('close', () => {
      return; // TODO?
    });
}

main(parentPort!, workerData as WorkerData);
