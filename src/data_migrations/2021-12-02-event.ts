/* This is free and unencumbered software released into the public domain. */

import { Config, parseConfig } from '../config.js';
import { pg, sql } from '../database.js';

import {
  AccountID,
  Engine,
  LogEventWithAddress,
  ConnectEnv,
  NetworkConfig,
  Transaction
} from '@aurora-is-near/engine';
import { program } from 'commander';
import externalConfig from 'config';
import pino, { Logger } from 'pino';

const logger = pino(pino.destination(2));

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends ConnectEnv {}
  }
}

export class ReindexWorker {
  protected readonly contractID: AccountID;
  protected readonly pgClient: pg.Client;

  constructor(
    public readonly config: Config,
    public readonly network: NetworkConfig,
    public readonly logger: Logger,
    public readonly engine: Engine
  ) {
    this.contractID = AccountID.parse(this.config.engine).unwrap();
    this.pgClient = new pg.Client(config.database);
  }

  async run(startBlockId: number, mode?: string): Promise<void> {
    await this.pgClient.connect();
    const step = Number(this.config.batchSize || 1000);
    let startEventQuery = sql.
      select('event.id').
      from('transaction').
      join('event').on({'transaction.id': 'event.transaction'}).
      order('event.id DESC').
      limit(1);
    if (startBlockId > 0){
      startEventQuery = startEventQuery.where(sql(`transaction.block <= ${startBlockId}`))
    }
    const eventQueryResult = await this.pgClient.query(startEventQuery.toParams());

    const startEventId = eventQueryResult.rows[0].id;
    for ( let eventId = startEventId; eventId > 0; eventId -= step ) {
      logger.info(`Fetching events ${eventId - step}..${eventId}`);
      const query = sql.
        select('DISTINCT transaction.block AS block_id, transaction.id AS transaction_id').
        from('transaction').
        join('event').on({'transaction.id': 'event.transaction'}).
        where({'event.from': null}).
        where(
          sql(`event.id >= ${eventId - step} AND event.id < ${eventId}`)
        );
      const result = await this.pgClient.query(query.toParams());

      for (const row of result.rows) {
        const blockId = parseInt(row.block_id)
        const blockProxy = await this.engine.getBlock(blockId, {
          transactions: 'full',
          contractID: this.contractID,
        });
        if (blockProxy.isErr()) {
          const error = blockProxy.unwrapErr();
          logger.error(error);
        } else {
          const block_ = blockProxy.unwrap()
          const block = block_.getMetadata();

          (block.transactions as Transaction[]).forEach( (transaction) => {
            (transaction.result?.result?.logs || []).forEach( (event, eventIndex) => {
              const event_ = event as LogEventWithAddress;
              const updateQuery = sql.
                update('event', {'from': Buffer.from(event_.address) }).
                where({ 'index': eventIndex, 'transaction': row.transaction_id })
              this.pgClient.query(updateQuery.toParams());
            })
          })

        }
      }
    }
    process.exit(0); // EX_OK
  }
}

async function main(argv: string[], env: NodeJS.ProcessEnv) {
  program
    .option('-d, --debug', 'enable debug output')
    .option('-v, --verbose', 'enable verbose output')
    .option(
      '--network <network>',
      `specify NEAR network ID (default: "${env.NEAR_ENV || 'local'}")`
    )
    .option(
      '--engine <account>',
      `specify Aurora Engine account ID (default: "${
        env.AURORA_ENGINE || 'aurora.test.near'
      }")`
    )
    .option(
      '-B, --block <block>',
      `specify block height to begin indexing from (default: 0)`
    )
    .option(
      '--batch-size <batchSize>',
      `specify batch size for fetching block metadata (default: 1000)`
    )
    .parse(argv);

  const opts = program.opts() as Config;
  const [network, config] = parseConfig(
    opts,
    (externalConfig as unknown) as Config,
    env
  );
  const blockID = opts.block !== undefined ? parseInt(opts.block as string) : 0;

  if (config.debug) {
    for (const source of externalConfig.util.getConfigSources()) {
      console.error(`Loaded configuration file ${source.name}.`);
    }
    console.error('Configuration:', config);
  }

  logger.info('starting reindexing of events');
  const engine = await Engine.connect(
    {
      network: network.id,
      endpoint: config.endpoint,
      contract: config.engine,
    },
    env
  );
  const indexer = new ReindexWorker(config, network, logger, engine);
  await indexer.run(blockID, 'follow');
}

main(process.argv, process.env).catch((error: Error) => {
  const errorMessage = error.message.startsWith('<')
    ? error.name
    : error.message;
  logger.error(errorMessage);
  process.exit(70); // EX_SOFTWARE
});
