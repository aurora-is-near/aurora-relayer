/* This is free and unencumbered software released into the public domain. */

import { Config, parseConfig } from './config.js';
import { pg, sql } from './database.js';
import { computeBlockHash, EmptyBlock, generateEmptyBlock } from './utils.js';

import {
  AccountID,
  BlockHeight,
  ConnectEnv,
  Engine,
  hexToBytes,
  LogEvent,
  NetworkConfig,
  Transaction,
} from '@aurora-is-near/engine';
import { program } from 'commander';
import externalConfig from 'config';
import * as readline from 'readline';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends ConnectEnv {}
  }
}

main(process.argv, process.env).catch((error: Error) => {
  const errorMessage = error.message.startsWith('<')
    ? error.name
    : error.message;
  console.error(errorMessage);
  process.exit(70); // EX_SOFTWARE
});

async function main(argv: string[], env: NodeJS.ProcessEnv) {
  program
    .option('-d, --debug', 'enable debug output')
    .option('-v, --verbose', 'enable verbose output')
    .option('-f, --force', 'reindex already indexed blocks')
    .option(
      '--database <url>',
      `specify PostgreSQL database URL (default: none)`
    )
    .option(
      '--network <network>',
      `specify NEAR network ID (default: "${env.NEAR_ENV || 'local'}")`
    )
    .option(
      '--endpoint <url>',
      `specify NEAR RPC endpoint URL (default: "${env.NEAR_URL || ''}")`
    )
    .option(
      '--engine <account>',
      `specify Aurora Engine account ID (default: "${
        env.AURORA_ENGINE || 'aurora.test.near'
      }")`
    )
    .parse(argv);

  const opts = program.opts() as Config;
  const [network, config] = parseConfig(
    opts,
    (externalConfig as unknown) as Config,
    env
  );

  if (config.debug) {
    for (const source of externalConfig.util.getConfigSources()) {
      console.error(`Loaded configuration file ${source.name}.`);
    }
    console.error('Configuration:', config);
  }

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

  const input = readline.createInterface({
    input: process.stdin,
    terminal: false,
  });
  for await (const line of input) {
    const blockID = Number.parseInt(line);
    await indexer.indexBlock(blockID);
  }
}

export class Indexer {
  protected readonly contractID: AccountID;
  protected readonly pgClient: pg.Client;

  constructor(
    public readonly config: Config,
    public readonly network: NetworkConfig,
    public readonly engine: Engine
  ) {
    this.contractID = AccountID.parse(this.config.engine).unwrap();
    this.pgClient = new pg.Client(config.database);
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
        await new Promise((resolve) => setTimeout(resolve, 100));
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
        transactions_root: block.transactionsRoot,
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
    event: LogEvent
  ): Promise<void> {
    console.error(
      `Indexing log event at #${blockID}:${transactionIndex}:${eventIndex}...`
    );

    const query = sql.insert('event', {
      transaction: transactionID,
      index: eventIndex,
      //id: null,
      data: event.data?.length ? event.data : null,
      topics: event.topics?.length
        ? event.topics.map((topic) => topic.toBytes())
        : null,
    });

    //if (this.config.debug) console.debug(query.toParams()); // DEBUG
    try {
      await this.pgClient.query(query.toParams());
    } catch (error) {
      console.error('indexEvent', error);
    }
  }
}
