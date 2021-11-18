/* This is free and unencumbered software released into the public domain. */

import { Config, parseConfig } from './config.js';
import sql from './database.js';
import { computeBlockHash } from './utils.js';

import {
  AccountID,
  base58ToBytes,
  ConnectEnv,
  NetworkConfig,
} from '@aurora-is-near/engine';
import { program } from 'commander';
import externalConfig from 'config';
import pg from 'pg';
import pino, { Logger } from 'pino';

interface BlockRow {
  chain: number;
  id: number;
  hash: Uint8Array;
  near_hash: Uint8Array | null;
  timestamp: Date | null;
  size: number;
  gas_limit: number;
  gas_used: number;
  parent_hash: Uint8Array;
  transactions_root: Uint8Array;
  state_root: Uint8Array;
  receipts_root: Uint8Array;
}

const logger = pino(pino.destination(2));

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends ConnectEnv {}
  }
}

export class PrehistoryIndexer {
  protected readonly archive: pg.Client;
  protected blockID = 0;

  constructor(
    public readonly config: Config,
    public readonly network: NetworkConfig,
    public readonly logger: Logger
  ) {
    if (!network.archiveURL) {
      console.error(`No archive database for the network ${network.id}`);
    }
    this.archive = new pg.Client(network.archiveURL);
  }

  async run(startBlockID: number, mode?: string): Promise<void> {
    const contractID = AccountID.parse(this.config.engine).unwrap();
    await this.archive.connect();

    const step = Number(this.config.batchSize || 1000);
    for (
      let blockID = startBlockID;
      blockID < this.network.firstBlock;
      blockID += step
    ) {
      const query = sql
        .select()
        .from('blocks')
        .where(
          sql(`block_height >= ${blockID} AND block_height < ${blockID + step}`)
        )
        .limit(step);
      //console.debug(query.toString()); // DEBUG

      const result = await this.archive.query(query.toParams());
      const rows: any = {};
      for (const row of result.rows) {
        rows[Number(row.block_height)] = row;
      }
      for (let i = 0; i < step; i++) {
        const blockID_ = blockID + i;
        if (blockID_ >= this.network.firstBlock) break;
        const blockHash = computeBlockHash(
          blockID_ as number,
          contractID.toString(),
          this.network.chainID
        );
        const parentHash =
          blockID_ == 0
            ? Buffer.alloc(32)
            : computeBlockHash(
                (blockID_ as number) - 1,
                contractID.toString(),
                this.network.chainID
              );

        const row = rows[blockID_];
        const columns: BlockRow = {
          chain: this.network.chainID,
          id: blockID_,
          hash: blockHash,
          near_hash: row ? base58ToBytes(row.block_hash) : null,
          timestamp:
            blockID_ == 0
              ? new Date(this.network.genesisDate!)
              : row
              ? new Date(Number(row.block_timestamp) / 1_000_000.0)
              : null,
          size: 0,
          gas_limit: 0,
          gas_used: 0,
          parent_hash: parentHash,
          transactions_root: Buffer.alloc(32),
          state_root: Buffer.alloc(32),
          receipts_root: Buffer.alloc(32),
        };
        console.log(this.serialize(columns));
      }
    } // for
    process.exit(0); // EX_OK
  }

  serialize(query: BlockRow) {
    const items = Object.keys(query).map((key) => {
      const value = (query as any)[key];
      if (value === null) {
        return '\\N';
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (value instanceof Uint8Array) {
        return `\\\\x${Buffer.from(value).toString('hex')}`;
      }
      return value;
    });
    return items.join('\t');
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

  logger.info('starting prehistory indexer');
  const indexer = new PrehistoryIndexer(config, network, logger);
  await indexer.run(blockID, 'follow');
}

main(process.argv, process.env).catch((error: Error) => {
  const errorMessage = error.message.startsWith('<')
    ? error.name
    : error.message;
  logger.error(errorMessage);
  process.exit(70); // EX_SOFTWARE
});
