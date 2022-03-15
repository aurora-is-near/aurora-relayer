/* This is free and unencumbered software released into the public domain. */

import { MessagePort, parentPort, workerData } from 'worker_threads';

import { Config } from './config.js';
import { pg, sql } from './database.js';
import format from 'pg-format';
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
  Transaction,
} from '@aurora-is-near/engine';

interface WorkerData {
  config: Config;
  network: NetworkConfig;
  env: ConnectEnv;
}

export class Indexer {
  protected readonly contractID: AccountID;
  protected readonly pgClient: pg.Client;
  protected pendingHeadBlock: number;

  constructor(
    public readonly config: Config,
    public readonly network: NetworkConfig,
    public readonly engine: Engine
  ) {
    this.contractID = AccountID.parse(this.config.engine).unwrap();
    this.pgClient = new pg.Client(config.database);
    this.pendingHeadBlock = 0;
  }

  async start(): Promise<void> {
    await this.pgClient.connect();
  }

  async indexBlock(blockID: BlockHeight): Promise<void> {
    console.error(`Indexing block #${blockID}...`);
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
          const query = sql.insert('block', {
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
          });
          //if (this.config.debug) console.debug(query.toString()); // DEBUG
          try {
            await this.pgClient.query(query.toParams());
          } catch (error) {
            console.error('indexBlock', error);
          }
          return;
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
      const query = sql.insert('block', {
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
      });
      //if (this.config.debug) console.debug(query.toString()); // DEBUG
      try {
        await this.pgClient.query(query.toParams());
      } catch (error) {
        console.error('indexBlock', error);
        return; // abort block
      }
      // Index all transactions contained in this block:
      (block.transactions as Transaction[]).forEach(
        async (transaction, transactionIndex) => {
          await this.indexTransaction(blockID, transactionIndex, transaction);
        }
      );

      return; // finish block
    } // for (;;)
  }

  async indexTransaction(
    blockID: BlockHeight,
    transactionIndex: number,
    transaction: Transaction
  ): Promise<void> {
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

    const query = sql
      .insert('transaction', {
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
        gas_used: result.result?.gasUsed || 0,
        value: transaction.value,
        input: transaction.data?.length ? transaction.data : null,
        v: transaction.v,
        r: transaction.r,
        s: transaction.s,
        status: status,
        output: output,
      })
      .returning('id');

    //if (this.config.debug) console.debug(query.toParams()); // DEBUG
    let transactionID = 0;
    try {
      const {
        rows: [{ id }],
      } = await this.pgClient.query(query.toParams());
      transactionID = parseInt(id as string);
      await this.pgClient.query(
        `NOTIFY transaction, ${format.literal(transaction.hash)}`
      );
    } catch (error) {
      console.error('indexTransaction', error);
      return;
    }

    // Index all log events emitted by this transaction:
    (transaction.result?.result?.logs || []).forEach(
      async (event, eventIndex) => {
        await this.indexEvent(
          blockID,
          transactionIndex,
          transactionID,
          eventIndex,
          event
        );
      }
    );
  }

  async indexEvent(
    blockID: BlockHeight,
    transactionIndex: number,
    transactionID: number,
    eventIndex: number,
    event: LogEventWithAddress | LogEvent
  ): Promise<void> {
    console.error(
      `Indexing log event at #${blockID}:${transactionIndex}:${eventIndex}...`
    );
    const event_ = event as LogEventWithAddress;
    const query = sql.insert('event', {
      transaction: transactionID,
      index: eventIndex,
      //id: null,
      data: event_.data?.length ? event_.data : null,
      from: event_.address ? Buffer.from(event_.address) : Buffer.alloc(20),
      topics: event_.topics?.length
        ? event_.topics.map((topic) => topic.toBytes())
        : null,
    });

    //if (this.config.debug) console.debug(query.toParams()); // DEBUG
    try {
      await this.pgClient.query(query.toParams());
      const logDetails = JSON.stringify({
        blockId: blockID,
        index: transactionIndex,
      });
      await this.pgClient.query(`NOTIFY log, ${format.literal(logDetails)}`);
    } catch (error) {
      console.error('indexEvent', error);
    }
  }

  async notifyNewHeads(blockID: number): Promise<void> {
    if (this.pendingHeadBlock == 0) {
      this.pendingHeadBlock = blockID;
    }
    for (;;) {
      if (await this.isBlockIndexed(this.pendingHeadBlock)) {
        await this.pgClient.query(
          `NOTIFY block, ${format.literal(this.pendingHeadBlock.toString())}`
        );
        this.pendingHeadBlock += 1;
        await this.delay(100);
      } else {
        return;
      }
    }
  }
  async isBlockIndexed(blockID: number): Promise<boolean> {
    const result = await this.pgClient.query(
      `SELECT 1 FROM block WHERE id = $1 LIMIT(1)`,
      [this.pendingHeadBlock]
    );
    return result.rows.length == 1;
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
  const blockHeight = (await engine.getBlockHeight()).unwrap() as number;

  parentPort
    .on('message', async (blockID: number) => {
      parentPort.postMessage(true); // ack the request
      await indexer.indexBlock(blockID);
      if (blockID > blockHeight) {
        await indexer.notifyNewHeads(blockID);
      }
    })
    .on('close', () => {
      return; // TODO?
    });
}

main(parentPort!, workerData as WorkerData);
