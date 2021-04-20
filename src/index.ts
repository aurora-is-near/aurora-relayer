#!/usr/bin/env node
/* This is free and unencumbered software released into the public domain. */

import { createApp } from './app.js';

import { ConnectEnv, Engine, NETWORKS } from '@aurora-is-near/engine';
import { program } from 'commander';
import nearProvider from 'near-web3-provider';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends ConnectEnv {}
  }
}

interface Options {
  debug: boolean;
  verbose: boolean;
  port: string;
  network: string;
  endpoint?: string;
  engine: string;
  signer: string;
}

main(process.argv, process.env);

async function main(argv: string[], env: NodeJS.ProcessEnv) {
  program
    .option('-d, --debug', 'enable debug output')
    .option('-v, --verbose', 'enable verbose output')
    .option("--port <port>", "specify port to listen to", '8545')
    .option("--network <network>", "specify NEAR network ID", env.NEAR_ENV || 'local')
    .option("--endpoint <url>", "specify NEAR RPC endpoint URL", env.NEAR_URL)
    .option("--engine <account>", "specify Aurora Engine account ID", env.AURORA_ENGINE || 'aurora.test.near')
    .option("--signer <account>", "specify signer account ID", env.NEAR_MASTER_ACCOUNT || 'test.near')
    .parse(argv);

  const options = program.opts() as Options;
  if (options.debug) console.log(options);

  const network = NETWORKS.get(options.network)!;
  const engine = await Engine.connect({
    network: network.id,
    endpoint: options.endpoint || network.nearEndpoint,
    contract: options.engine || network.contractID,
    signer: options.signer,
  }, env);
  const provider = new nearProvider.NearProvider({
    networkId: network.id,
    nodeUrl: options.endpoint || network.nearEndpoint,
    evmAccountId: options.engine || network.contractID,
    masterAccountId: options.signer,
    keyPath: (network.id == 'local') && '~/.near/validator_key.json',
  });

  const port = parseInt(options.port);
  const app = await createApp(options, engine, provider);
  app.listen(port, () => {
    console.log(`Web3 JSON-RPC proxy for the NEAR ${network.label} listening at http://localhost:${port}...`)
  });
}
