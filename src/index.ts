#!/usr/bin/env node
/* This is free and unencumbered software released into the public domain. */

import { createApp } from './app.js';
import { Config, parseConfig } from './config.js';

import { ConnectEnv, Engine } from '@aurora-is-near/engine';
import { program } from 'commander';
import externalConfig from 'config';
import nearProvider from 'near-web3-provider';
import pg from 'pg';
import pino from 'pino';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends ConnectEnv {}
  }
}

main(process.argv, process.env);

async function main(argv: string[], env: NodeJS.ProcessEnv) {
  program
    .option('-d, --debug', 'enable debug output')
    .option('-v, --verbose', 'enable verbose output')
    .option("--database <url>", `specify PostgreSQL database URL (default: none)`)
    .option("--port <port>", `specify port to listen to (default: ${8545})`)
    .option("--network <network>", `specify NEAR network ID (default: "${env.NEAR_ENV || "local"}")`)
    .option("--endpoint <url>", `specify NEAR RPC endpoint URL (default: "${env.NEAR_URL || ""}")`)
    .option("--engine <account>", `specify Aurora Engine account ID (default: "${env.AURORA_ENGINE || "aurora.test.near"}")`)
    .option("--signer <account>", `specify signer account ID (default: "${env.NEAR_MASTER_ACCOUNT || "test.near"}")`)
    .parse(argv);

  const [network, config] = parseConfig(program.opts() as Config, externalConfig as unknown as Config, env);

  if (config.debug) {
    for (const source of externalConfig.util.getConfigSources()) {
      console.error(`Loaded configuration file ${source.name}.`);
    }
    console.error("Configuration:", config);
  }

  if (config.database) {
    const sql = new pg.Client(config.database);
    await sql.connect();
    await sql.query('SELECT 1'); // test connectivity
  }

  const engine = await Engine.connect({
    network: network.id,
    endpoint: config.endpoint,
    contract: config.engine,
    signer: config.signer,
  }, env);

  const provider = new nearProvider.NearProvider({ // deprecated
    networkId: network.id,
    nodeUrl: config.endpoint,
    evmAccountId: config.engine,
    masterAccountId: config.signer,
    keyPath: (network.id == 'local') && '~/.near/validator_key.json',
  });

  const logger = pino();
  logger.info("starting server");

  const app = await createApp(config, logger, engine, provider);
  app.listen(config.port, () => {
    if (config.verbose || config.debug) {
      console.error(`Relayer for the NEAR ${network.label} listening at http://localhost:${config.port}...`)
    }
  });
}
