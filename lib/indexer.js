/* This is free and unencumbered software released into the public domain. */
import { parseConfig } from './config.js';
import { computeBlockHash } from './utils.js';
import { AccountID, Engine, hexToBytes, } from '@aurora-is-near/engine';
import { program } from 'commander';
import externalConfig from 'config';
import pg from 'pg';
import pino from 'pino';
import sql from 'sql-bricks-postgres';
const sqlConvert = sql.convert;
sql.convert = (val) => {
    if (val instanceof Uint8Array) {
        return `'\\x${Buffer.from(val).toString('hex')}'`;
    }
    return sqlConvert(val);
};
const logger = pino();
export class Indexer {
    constructor(config, network, logger, engine) {
        this.config = config;
        this.network = network;
        this.logger = logger;
        this.engine = engine;
        this.blockID = 0;
        this.pgClient = new pg.Client(config.database);
    }
    async start(blockID, mode) {
        await this.pgClient.connect();
        if (blockID !== undefined) {
            this.blockID = blockID;
        }
        else if (mode == 'follow') {
            this.blockID = (await this.engine.getBlockHeight()).unwrap();
        }
        else if (mode == 'resume') {
            const { rows: [{ maxID }], } = await this.pgClient.query('SELECT MAX(id)::int AS "maxID" FROM block');
            this.blockID = maxID !== null ? maxID + 1 : 0;
        }
        this.logger.info(`resuming from block #${this.blockID}`);
        for (;;) {
            await this.indexBlock(this.blockID);
            this.blockID += 1;
        }
    }
    async indexBlock(blockID) {
        //console.debug('indexBlock', blockID); // DEBUG
        this.logger.info({ block: { id: blockID } }, `indexing block #${blockID}`);
        const contractID = AccountID.parse(this.config.engine).unwrap();
        for (;;) {
            const currentBlockHeight = (await this.engine.getBlockHeight()).unwrap();
            const proxy = await this.engine.getBlock(blockID, {
                transactions: 'full',
                contractID: contractID,
            });
            if (proxy.isErr()) {
                const error = proxy.unwrapErr();
                if (error.startsWith('[-32000] Server error: DB Not Found Error')) {
                    if (blockID < currentBlockHeight) {
                        this.logger.error(error);
                        return; // a skip block, or an unavailable block on a nonarchival node
                    }
                    else {
                        await new Promise((resolve) => setTimeout(resolve, 100));
                        continue; // wait for the next block to be produced
                    }
                }
                if (this.config.debug)
                    console.error(error); // DEBUG
                this.logger.error(error);
                await new Promise((resolve) => setTimeout(resolve, 100));
                continue; // retry block
            }
            const block_ = proxy.unwrap();
            const block = block_.getMetadata();
            const blockHash = computeBlockHash(block.number, contractID.toString(), this.network.chainID);
            const parentHash = computeBlockHash(block.number - 1, contractID.toString(), this.network.chainID);
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
                await this.pgClient.query(`NOTIFY block, '${block.number}'`);
            }
            catch (error) {
                console.error('indexBlock', error);
                if (this.config.debug)
                    this.logger.error(error);
                return; // abort block
            }
            // Index all transactions contained in this block:
            block.transactions.forEach(async (transaction, transactionIndex) => {
                await this.indexTransaction(blockID, transactionIndex, transaction);
            });
            return; // finish block
        }
    }
    async indexTransaction(blockID, transactionIndex, transaction) {
        //console.debug('indexTransaction', blockID, transactionIndex, transaction); // DEBUG
        this.logger.info({
            block: { id: blockID },
            transaction: { index: transactionIndex, hash: transaction.hash },
        }, `indexing transaction ${transaction.hash} at #${blockID}:${transactionIndex}`);
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
            await this.pgClient.query(`NOTIFY transaction, '${JSON.stringify({ blockId: blockID, index: transactionIndex })}'`);
        }
        catch (error) {
            console.error('indexTransaction', error);
            if (this.config.debug)
                this.logger.error(error);
            return;
        }
        // Index all log events emitted by this transaction:
        (transaction.result?.result?.logs || []).forEach(async (event, eventIndex) => {
            await this.indexEvent(blockID, transactionIndex, transactionID, eventIndex, event);
        });
    }
    async indexEvent(blockID, transactionIndex, transactionID, eventIndex, event) {
        //console.debug('indexEvent', blockID, transactionIndex, transactionID, eventIndex, event); // DEBUG
        this.logger.info({
            block: { id: blockID },
            transaction: { index: transactionIndex, id: transactionID },
            event: { index: eventIndex },
        }, `indexing log event at #${blockID}:${transactionIndex}:${eventIndex}`);
        const query = sql.insert('event', {
            transaction: transactionID,
            index: eventIndex,
            //id: null,
            data: event.data?.length ? event.data : null,
            topics: event.topics?.length
                ? event.topics.map((topic) => topic.toBytes())
                : null,
        });
        //if (this.config.debug) console.debug(query.toParams()); // DEBUG
        try {
            await this.pgClient.query(query.toParams());
        }
        catch (error) {
            console.error('indexEvent', error);
            if (this.config.debug)
                this.logger.error(error);
            return;
        }
    }
}
async function main(argv, env) {
    program
        .option('-d, --debug', 'enable debug output')
        .option('-v, --verbose', 'enable verbose output')
        .option('-f, --force', 'reindex already indexed data')
        .option('--database <url>', `specify PostgreSQL database URL (default: none)`)
        .option('--network <network>', `specify NEAR network ID (default: "${env.NEAR_ENV || 'local'}")`)
        .option('--endpoint <url>', `specify NEAR RPC endpoint URL (default: "${env.NEAR_URL || ''}")`)
        .option('--engine <account>', `specify Aurora Engine account ID (default: "${env.AURORA_ENGINE || 'aurora.test.near'}")`)
        .option('-B, --block <block>', `specify block height to begin indexing from (default: current)`)
        .parse(argv);
    const opts = program.opts();
    const [network, config] = parseConfig(opts, externalConfig, env);
    const blockID = opts.block !== undefined ? parseInt(opts.block) : undefined;
    if (config.debug) {
        for (const source of externalConfig.util.getConfigSources()) {
            console.error(`Loaded configuration file ${source.name}.`);
        }
        console.error('Configuration:', config);
    }
    logger.info(`connecting to ${config.endpoint}...`);
    const engine = await Engine.connect({
        network: network.id,
        endpoint: config.endpoint,
        contract: config.engine,
    }, env);
    logger.info('starting indexer');
    const indexer = new Indexer(config, network, logger, engine);
    await indexer.start(blockID, 'follow');
}
main(process.argv, process.env).catch((error) => {
    const errorMessage = error.message.startsWith('<')
        ? error.name
        : error.message;
    logger.error(errorMessage);
    process.exit(70); // EX_SOFTWARE
});
