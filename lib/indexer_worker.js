/* This is free and unencumbered software released into the public domain. */
import { parentPort, workerData } from 'worker_threads';
import { pg, sql } from './database.js';
import { computeBlockHash, generateEmptyBlock } from './utils.js';
import { AccountID, Engine, hexToBytes, } from '@aurora-is-near/engine';
export class Indexer {
    constructor(config, network, engine) {
        this.config = config;
        this.network = network;
        this.engine = engine;
        this.contractID = AccountID.parse(this.config.engine).unwrap();
        this.pgClient = new pg.Client(config.database);
    }
    async start() {
        await this.pgClient.connect();
    }
    async indexBlock(blockID) {
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
                    const emptyBlock = generateEmptyBlock(blockID, this.contractID.toString(), this.network.chainID);
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
                    }
                    catch (error) {
                        console.error('indexBlock', error);
                    }
                    return;
                }
                if (this.config.debug)
                    console.error(error); // DEBUG
                await new Promise((resolve) => setTimeout(resolve, 100));
                continue; // retry block
            }
            const block_ = proxy.unwrap();
            const block = block_.getMetadata();
            const blockHash = computeBlockHash(block.number, this.contractID.toString(), this.network.chainID);
            const parentHash = computeBlockHash(block.number - 1, this.contractID.toString(), this.network.chainID);
            const query = sql.insert('block', {
                chain: this.network.chainID,
                id: block.number,
                hash: blockHash,
                near_hash: block_.near?.hash,
                timestamp: new Date(block.timestamp * 1000).toISOString(),
                size: block.size,
                gas_limit: 0,
                gas_used: 0,
                parent_hash: parentHash,
                transactions_root: block.transactionsRoot,
                state_root: block.stateRoot,
                receipts_root: block.receiptsRoot,
            });
            //if (this.config.debug) console.debug(query.toString()); // DEBUG
            try {
                await this.pgClient.query(query.toParams());
            }
            catch (error) {
                console.error('indexBlock', error);
                return; // abort block
            }
            // Index all transactions contained in this block:
            block.transactions.forEach(async (transaction, transactionIndex) => {
                await this.indexTransaction(blockID, transactionIndex, transaction);
            });
            return; // finish block
        } // for (;;)
    }
    async indexTransaction(blockID, transactionIndex, transaction) {
        console.error(`Indexing transaction ${transaction.hash} at #${blockID}:${transactionIndex}...`);
        const to = transaction.to;
        const result = transaction.result;
        let status;
        let output = null;
        if (typeof result?.result?.status === 'boolean') {
            status = result.result?.status;
            output = result.output;
        }
        else {
            status = result.result?.status.enum === 'success';
            if (result.result?.status.success?.output.length)
                output = result.result?.status.success?.output;
        }
        const query = sql
            .insert('transaction', {
            block: blockID,
            index: transactionIndex,
            //id: null,
            hash: Buffer.from(hexToBytes(transaction.hash)),
            near_hash: transaction.near?.hash,
            near_receipt_hash: transaction.near?.receiptHash,
            from: Buffer.from(transaction.from.toBytes()),
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
            const { rows: [{ id }], } = await this.pgClient.query(query.toParams());
            transactionID = parseInt(id);
        }
        catch (error) {
            console.error('indexTransaction', error);
            return;
        }
        // Index all log events emitted by this transaction:
        (transaction.result?.result?.logs || []).forEach(async (event, eventIndex) => {
            await this.indexEvent(blockID, transactionIndex, transactionID, eventIndex, event);
        });
    }
    async indexEvent(blockID, transactionIndex, transactionID, eventIndex, event) {
        console.error(`Indexing log event at #${blockID}:${transactionIndex}:${eventIndex}...`);
        const event_ = event;
        const query = sql.insert('event', {
            transaction: transactionID,
            index: eventIndex,
            //id: null,
            data: event_.data?.length ? event_.data : null,
            from: Buffer.from(event_.address?.length == 20 ? event_.address : '00000000000000000000'),
            topics: event_.topics?.length
                ? event_.topics.map((topic) => topic.toBytes())
                : null,
        });
        //if (this.config.debug) console.debug(query.toParams()); // DEBUG
        try {
            await this.pgClient.query(query.toParams());
        }
        catch (error) {
            console.error('indexEvent', error);
        }
    }
}
async function main(parentPort, workerData) {
    const { config, network, env } = workerData;
    const engine = await Engine.connect({
        network: network.id,
        endpoint: config.endpoint,
        contract: config.engine,
    }, env);
    const indexer = new Indexer(config, network, engine);
    await indexer.start();
    parentPort
        .on('message', async (blockID) => {
        parentPort.postMessage(true); // ack the request
        await indexer.indexBlock(blockID);
    })
        .on('close', () => {
        return; // TODO?
    });
}
main(parentPort, workerData);
