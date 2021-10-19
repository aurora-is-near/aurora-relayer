/* This is free and unencumbered software released into the public domain. */
import { parseConfig } from './config.js';
import { computeBlockHash } from './utils.js';
import { AccountID, base58ToBytes, } from '@aurora-is-near/engine';
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
const logger = pino(pino.destination(2));
export class PrehistoryIndexer {
    constructor(config, network, logger) {
        this.config = config;
        this.network = network;
        this.logger = logger;
        this.blockID = 0;
        if (!network.archiveURL) {
            console.error(`No archive database for the network ${network.id}`);
        }
        this.archive = new pg.Client(network.archiveURL);
    }
    async start(startBlockID, mode) {
        const contractID = AccountID.parse(this.config.engine).unwrap();
        await this.archive.connect();
        const step = Number(this.config.batchSize || 1000);
        for (let blockID = startBlockID; blockID < this.network.firstBlock; blockID += step) {
            const query = sql
                .select()
                .from('blocks')
                .where(sql(`block_height >= ${blockID} AND block_height < ${blockID + step}`))
                .limit(step);
            //console.debug(query.toString()); // DEBUG
            const result = await this.archive.query(query.toParams());
            const rows = {};
            for (const row of result.rows) {
                rows[Number(row.block_height)] = row;
            }
            for (let i = 0; i < step; i++) {
                const blockID_ = blockID + i;
                if (blockID_ >= this.network.firstBlock)
                    break;
                const blockHash = computeBlockHash(blockID_, contractID.toString(), this.network.chainID);
                const parentHash = blockID_ == 0
                    ? Buffer.alloc(32)
                    : computeBlockHash(blockID_ - 1, contractID.toString(), this.network.chainID);
                const row = rows[blockID_];
                const query = sql.insert('block', {
                    chain: this.network.chainID,
                    id: blockID_,
                    hash: blockHash,
                    near_hash: row ? base58ToBytes(row.block_hash) : null,
                    timestamp: row
                        ? new Date(Number(row.block_timestamp) / 1000000).toISOString()
                        : null,
                    size: 0,
                    gas_limit: 0,
                    gas_used: 0,
                    parent_hash: parentHash,
                    transactions_root: Buffer.alloc(32),
                    state_root: Buffer.alloc(32),
                    receipts_root: Buffer.alloc(32),
                });
                console.log(this.serialize(query.toParams()) + ';');
            }
        } // for
        process.exit(0); // EX_OK
    }
    serialize(query) {
        return query.text.replaceAll(/\$(\d+)/g, (match, p1) => {
            const index = Number(p1) - 1;
            return sql.convert(query.values[index]);
        });
    }
}
async function main(argv, env) {
    program
        .option('-d, --debug', 'enable debug output')
        .option('-v, --verbose', 'enable verbose output')
        .option('--network <network>', `specify NEAR network ID (default: "${env.NEAR_ENV || 'local'}")`)
        .option('--engine <account>', `specify Aurora Engine account ID (default: "${env.AURORA_ENGINE || 'aurora.test.near'}")`)
        .option('-B, --block <block>', `specify block height to begin indexing from (default: 0)`)
        .option('--batch-size <batchSize>', `specify batch size for fetching block metadata (default: 1000)`)
        .parse(argv);
    const opts = program.opts();
    const [network, config] = parseConfig(opts, externalConfig, env);
    const blockID = opts.block !== undefined ? parseInt(opts.block) : 0;
    if (config.debug) {
        for (const source of externalConfig.util.getConfigSources()) {
            console.error(`Loaded configuration file ${source.name}.`);
        }
        console.error('Configuration:', config);
    }
    logger.info('starting prehistory indexer');
    const indexer = new PrehistoryIndexer(config, network, logger);
    await indexer.start(blockID, 'follow');
}
main(process.argv, process.env).catch((error) => {
    const errorMessage = error.message.startsWith('<')
        ? error.name
        : error.message;
    logger.error(errorMessage);
    process.exit(70); // EX_SOFTWARE
});
