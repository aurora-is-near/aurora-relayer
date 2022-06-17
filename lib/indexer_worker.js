/* This is free and unencumbered software released into the public domain. */
import { parentPort, workerData } from 'worker_threads';
import { Indexer } from './indexer.js';
import { Engine } from '@aurora-is-near/engine';
async function main(parentPort, workerData) {
    const { config, network, env } = workerData;
    const engine = await Engine.connect({
        network: network.id,
        endpoint: config.endpoint,
        contract: config.engine,
    }, env);
    const indexer = new Indexer(config, network, engine);
    await indexer.start();
    setTimeout(function () {
        indexer.insertNewHeads();
    });
    parentPort
        .on('message', async (block) => {
        parentPort.postMessage(true); // ack the request
        const blockData = await indexer.blockData(block.id);
        if (block.is_head) {
            indexer.notifyNewHeads(block.id, blockData);
        }
        else {
            await indexer.insert(blockData);
            console.error(`Indexing Gap Block #${block.id}...`);
        }
    })
        .on('close', () => {
        return; // TODO?
    });
}
main(parentPort, workerData);
