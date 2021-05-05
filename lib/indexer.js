/* This is free and unencumbered software released into the public domain. */
import { parseConfig } from './config.js';
import { AccountID, Engine, hexToBytes, } from '@aurora-is-near/engine';
import { program } from 'commander';
import externalConfig from 'config';
import pg from 'pg';
import pino from 'pino';
import sql from 'sql-bricks';
const sqlConvert = sql.convert;
sql.convert = (val) => {
    if (val instanceof Uint8Array) {
        return `'\\x${Buffer.from(val).toString('hex')}'`;
    }
    return sqlConvert(val);
};
export class Indexer {
    constructor(config, network, logger, engine) {
        this.config = config;
        this.network = network;
        this.logger = logger;
        this.engine = engine;
        this.blockID = 0;
        this.pgClient = new pg.Client(config.database);
    }
    async start(blockID) {
        await this.pgClient.connect();
        const { rows: [{ maxID }], } = await this.pgClient.query('SELECT MAX(id)::int AS "maxID" FROM block');
        this.blockID = maxID === null ? blockID : maxID + 1;
        this.logger.info(`resuming from block #${this.blockID}`);
        for (;;) {
            await this.indexBlock(this.blockID);
            this.blockID += 1;
        }
    }
    async indexBlock(blockID) {
        this.logger.info({ block: { id: blockID } }, `indexing block #${blockID}`);
        for (;;) {
            const proxy = await this.engine.getBlock(blockID, {
                transactions: 'full',
                contractID: AccountID.parse(this.config.engine).unwrap(),
            });
            if (proxy.isErr()) {
                //console.debug(proxy.unwrapErr());
                await new Promise((resolve) => setTimeout(resolve, 100));
                continue;
            }
            const block = proxy.unwrap().getMetadata();
            const query = sql.insert('block', {
                chain: this.network.chainID,
                id: block.number,
                hash: hexToBytes(block.hash),
                timestamp: new Date(block.timestamp * 1000).toISOString(),
                size: block.size,
                gas_limit: block.gasLimit,
                gas_used: block.gasUsed,
                parent_hash: hexToBytes(block.parentHash),
                transactions_root: block.transactionsRoot,
                state_root: block.stateRoot,
                receipts_root: block.receiptsRoot,
            });
            if (this.config.debug) {
                //console.debug(query.toString()); // DEBUG
            }
            await this.pgClient.query(query.toParams());
            let transactionIndex = 0;
            for (const transaction of block.transactions) {
                await this.indexTransaction(blockID, transactionIndex, transaction);
                transactionIndex += 1;
            }
            return;
        }
    }
    async indexTransaction(blockID, transactionIndex, transaction) {
        this.logger.info({
            block: { id: blockID },
            transaction: { index: transactionIndex, hash: transaction.hash },
        }, `indexing transaction ${transaction.hash} at #${blockID}:${transactionIndex}`);
        const to = transaction.to;
        const query = sql.insert('transaction', {
            block: blockID,
            index: transactionIndex,
            //id: null,
            hash: Buffer.from(hexToBytes(transaction.hash)),
            from: Buffer.from(transaction.from.toBytes()),
            to: to?.isSome() ? Buffer.from(to.unwrap().toBytes()) : null,
            nonce: transaction.nonce,
            gas_price: transaction.gasPrice,
            gas_limit: transaction.gasLimit,
            gas_used: transaction.result?.gasUsed || 0,
            value: transaction.value,
            data: transaction.data?.length ? transaction.data : null,
            v: transaction.v,
            r: transaction.r,
            s: transaction.s,
            status: transaction.result?.status,
        });
        // TODO: transaction.result?.output
        // TODO: transaction.result?.logs
        if (this.config.debug) {
            //console.debug(query.toParams()); // DEBUG
        }
        await this.pgClient.query(query.toParams());
    }
    async indexEvent() {
        // TODO
    }
}
async function main(argv, env) {
    program
        .option('-d, --debug', 'enable debug output')
        .option('-v, --verbose', 'enable verbose output')
        .option('--database <url>', `specify PostgreSQL database URL (default: none)`)
        .option('--network <network>', `specify NEAR network ID (default: "${env.NEAR_ENV || 'local'}")`)
        .option('--endpoint <url>', `specify NEAR RPC endpoint URL (default: "${env.NEAR_URL || ''}")`)
        .option('--engine <account>', `specify Aurora Engine account ID (default: "${env.AURORA_ENGINE || 'aurora.test.near'}")`)
        .option('--block <block>', `specify block height to begin indexing from`, '0')
        .parse(argv);
    const opts = program.opts();
    const [network, config] = parseConfig(opts, externalConfig, env);
    const blockID = parseInt(opts.block);
    if (config.debug) {
        for (const source of externalConfig.util.getConfigSources()) {
            console.error(`Loaded configuration file ${source.name}.`);
        }
        console.error('Configuration:', config);
    }
    const logger = pino();
    const engine = await Engine.connect({
        network: network.id,
        endpoint: config.endpoint,
        contract: config.engine,
    }, env);
    logger.info('starting indexer');
    const indexer = new Indexer(config, network, logger, engine);
    await indexer.start(blockID);
}
main(process.argv, process.env);
