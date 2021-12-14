/* This is free and unencumbered software released into the public domain. */

import { Config, parseConfig } from '../config.js';
import { pg, sql } from '../database.js';
import { emptyTransactionsRoot } from '../utils.js';

import {
  AccountID,
  Engine,
  ConnectEnv,
  NetworkConfig,
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

class ReindexWorker {
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

  async run(blockId: number): Promise<void> {
    await this.pgClient.connect();
    const step = Number(this.config.batchSize || 1000);

    let startBlockQuery = sql
      .select('block.id')
      .from('block')
      .order('block.id DESC')
      .limit(1);
    if (blockId > 0) {
      startBlockQuery = startBlockQuery.where(
        sql(`block.id <= $1`, blockId)
      );
    }
    const transactionQueryResult = await this.pgClient.query(
      startBlockQuery.toParams()
    );
    const startBlockId = transactionQueryResult.rows[0].id;

    for (let blockId = startBlockId; blockId > 0; blockId -= step) {
      const endBlockId = blockId - step > 0 ? blockId - step : 0;
      logger.info(`Fetching blocks ${endBlockId}..${blockId}`);
      const query = sql
        .select('DISTINCT block.id AS block_id')
        .from('block')
        .leftJoin('transaction')
        .on({ 'transaction.block': 'block.id' })
        .where(
          sql(
            `transaction.block IS NULL AND block.id >= $1 AND block.id < $2`,
            blockId - step,
            blockId
          )
        );
      const result = await this.pgClient.query(query.toParams());
      if (result.rows.length > 0) {
        const blockIds = result.rows.map((row: any) => parseInt(row.block_id));
        const updateQuery = sql
          .update('block', { transactions_root: emptyTransactionsRoot() })
          .where(sql.in('id', blockIds));
        await this.pgClient.query(updateQuery.toParams());
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

  logger.info('starting reindexing of transactions');
  const engine = await Engine.connect(
    {
      network: network.id,
      endpoint: config.endpoint,
      contract: config.engine,
    },
    env
  );
  const indexer = new ReindexWorker(config, network, logger, engine);
  await indexer.run(blockID);
}

main(process.argv, process.env).catch((error: Error) => {
  const errorMessage = error.message.startsWith('<')
    ? error.name
    : error.message;
  logger.error(errorMessage);
  process.exit(70); // EX_SOFTWARE
});
