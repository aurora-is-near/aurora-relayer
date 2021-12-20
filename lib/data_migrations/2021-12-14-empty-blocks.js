/* This is free and unencumbered software released into the public domain. */
import { parseConfig } from '../config.js';
import { pg, sql } from '../database.js';
import { emptyTransactionsRoot } from '../utils.js';
import { AccountID, Engine, } from '@aurora-is-near/engine';
import { program } from 'commander';
import externalConfig from 'config';
import pino from 'pino';
const logger = pino(pino.destination(2));
class ReindexWorker {
    constructor(config, network, logger, engine) {
        this.config = config;
        this.network = network;
        this.logger = logger;
        this.engine = engine;
        this.contractID = AccountID.parse(this.config.engine).unwrap();
        this.pgClient = new pg.Client(config.database);
    }
    async run(blockId) {
        await this.pgClient.connect();
        const step = Number(this.config.batchSize || 1000);
        let startBlockQuery = sql
            .select('block.id')
            .from('block')
            .order('block.id DESC')
            .limit(1);
        if (blockId > 0) {
            startBlockQuery = startBlockQuery.where(sql(`block.id <= $1`, blockId));
        }
        const transactionQueryResult = await this.pgClient.query(startBlockQuery.toParams());
        const startBlockId = transactionQueryResult.rows[0].id;
        for (let blockId = startBlockId; blockId > 0; blockId -= step) {
            const endBlockId = blockId - step > 0 ? blockId - step : 0;
            logger.info(`Fetching blocks ${endBlockId}..${blockId}`);
            const updateQuery = sql
                .update('block', { transactions_root: emptyTransactionsRoot() })
                .where(sql('(SELECT COUNT(id) FROM transaction t WHERE t.block = block.id) = 0'))
                .where(sql(`block.id >= $1 AND block.id < $2`, blockId - step, blockId));
            await this.pgClient.query(updateQuery.toParams());
        }
        process.exit(0); // EX_OK
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
    logger.info('starting reindexing of transactions');
    const engine = await Engine.connect({
        network: network.id,
        endpoint: config.endpoint,
        contract: config.engine,
    }, env);
    const indexer = new ReindexWorker(config, network, logger, engine);
    await indexer.run(blockID);
}
main(process.argv, process.env).catch((error) => {
    const errorMessage = error.message.startsWith('<')
        ? error.name
        : error.message;
    logger.error(errorMessage);
    process.exit(70); // EX_SOFTWARE
});
