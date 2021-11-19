/* This is free and unencumbered software released into the public domain. */

import { Config, parseConfig } from './config.js';

import { StaticPool } from 'node-worker-threads-pool';

import { ConnectEnv } from '@aurora-is-near/engine';
import { program } from 'commander';
import externalConfig from 'config';
import FastPriorityQueue from 'fastpriorityqueue';
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

  const workers = new StaticPool({
    size: 4, // TODO: make this configurable
    task: './lib/indexer_worker.js',
    workerData: {
      config,
      network,
      env: {
        NEAR_ENV: env.NEAR_ENV,
        NEAR_URL: env.NEAR_URL,
      },
    },
  });

  const queue = new FastPriorityQueue((a: number, b: number) => {
    return a > b;
  });

  let inputOpen = true;
  const input = readline.createInterface({
    input: process.stdin,
    terminal: false,
  });
  input
    .on('line', (line: string) => {
      const blockID = Number.parseInt(line);
      queue.add(blockID);
    })
    .on('close', () => {
      inputOpen = false;
    });

  while (!queue.isEmpty() || inputOpen) {
    const blockID = queue.poll() as number;
    if (blockID === undefined) {
      // The queue is empty, wait for more input:
      await new Promise((resolve) => setTimeout(resolve, 10));
      continue;
    }
    await workers.exec(blockID);
  }
  process.exit(0);
}
