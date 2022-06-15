/* This is free and unencumbered software released into the public domain. */

import { MessagePort, parentPort, workerData } from 'worker_threads';

import { Config } from './config.js';
import { Indexer } from './indexer.js';
import { ConnectEnv, Engine, NetworkConfig } from '@aurora-is-near/engine';

interface WorkerData {
  config: Config;
  network: NetworkConfig;
  env: ConnectEnv;
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
      const blockData = await indexer.blockData(block.id);
      if (block.is_head) {
        indexer.notifyNewHeads(block.id, blockData);
      } else {
        await indexer.insert(blockData);
      }
    })
    .on('close', () => {
      return; // TODO?
    });
}

main(parentPort!, workerData as WorkerData);
