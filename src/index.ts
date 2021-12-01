#!/usr/bin/env node
/* This is free and unencumbered software released into the public domain. */

import { createApp } from './app.js';
import { Config, parseConfig } from './config.js';
import { pg } from './database.js';

import { ConnectEnv, Engine } from '@aurora-is-near/engine';
import { program } from 'commander';
import externalConfig from 'config';
import pino from 'pino';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends ConnectEnv {
      CF_API_TOKEN?: string; // Cloudflare API token
      CF_ACCOUNT_ID?: string; // Cloudflare account ID
      CF_LIST_ID?: string; // Cloudflare IP blacklist ID
    }
  }
}

async function main(argv: string[], env: NodeJS.ProcessEnv): Promise<void> {
  program
    .option('-d, --debug', 'enable debug output')
    .option('-v, --verbose', 'enable verbose output')
    .option(
      '--database <url>',
      `specify PostgreSQL database URL (default: none)`
    )
    .option('--port <port>', `specify port to listen to (default: ${8545})`)
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
    .option(
      '--signer <account>',
      `specify signer account ID (default: "${
        env.NEAR_MASTER_ACCOUNT || 'test.near'
      }")`
    )
    .option('--signer-key <path>', `specify path to signer key JSON file`)
    .parse(argv);

  const [network, config] = parseConfig(
    program.opts() as Config,
    (externalConfig as unknown) as Config,
    env
  );

  if (config.debug) {
    for (const source of externalConfig.util.getConfigSources()) {
      console.error(`Loaded configuration file ${source.name}.`);
    }
    console.error('Configuration:', config);
  }

  const logger = pino();
  logger.info('starting server');

  if (config.database) {
    try {
      const sql = new pg.Client(config.database);
      await sql.connect();
      await sql.query('SELECT 1'); // test connectivity
    } catch (error: any) {
      console.error(
        `aurora-relayer: Invalid database configuration: ${error.message}`
      );
      if (config.debug) console.error(error);
      process.exit(78); // EX_CONFIG
    }
  }

  const engine = await Engine.connect(
    {
      network: network.id,
      endpoint: config.endpoint,
      contract: config.engine,
      signer: config.signer,
    },
    env
  );

  if (Array.isArray(config.signerKeys) && config.signerKeys.length > 0) {
    engine.keyStore.loadKeyFiles(config.signerKeys);
    console.error(`Loaded signer key files ${config.signerKeys.join(', ')}.`);
  } else if (config.signerKey) {
    engine.keyStore.loadKeyFile(config.signerKey);
    console.error(`Loaded signer key file ${config.signerKey}.`);
  }

  const app = await createApp(config, logger, engine);
  app.listen(config.port, () => {
    if (config.verbose || config.debug) {
      console.error(
        `Relayer for the NEAR ${network.label} listening at http://localhost:${config.port}...`
      );
    }
  });
}

main(process.argv, process.env).catch((error: Error) => {
  console.error(`aurora-relayer: ${error.message}`);
  process.exit(78); // EX_CONFIG
});
