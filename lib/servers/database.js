/* This is free and unencumbered software released into the public domain. */
import { SkeletonServer } from './skeleton.js';
import postgres from 'postgres';
export class DatabaseServer extends SkeletonServer {
    constructor(config, logger, engine, provider) {
        super();
        this.config = config;
        this.logger = logger;
        this.engine = engine;
        this.provider = provider;
        this.sql = postgres(config.database);
        this._init();
    }
    async _init() {
        await this.sql.listen('block', (payload) => {
            const blockID = parseInt(payload);
            if (isNaN(blockID))
                return; // ignore UFOs
            this.logger.info({ block: { id: blockID } }, "block received");
            // TODO: notify subscribers
        });
    }
}
