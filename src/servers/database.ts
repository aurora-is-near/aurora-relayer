/* This is free and unencumbered software released into the public domain. */

import { SkeletonServer } from './skeleton.js';

//import * as api from '../api.js';
import { Config } from '../config.js';
//import { unimplemented } from '../errors.js';
import { NearProvider } from '../provider.js';

//import { Address, BlockOptions, Engine, formatU256, hexToBase58, hexToBytes, intToHex } from '@aurora-is-near/engine';
import { Engine } from '@aurora-is-near/engine';
import { Logger } from 'pino';
import postgres from 'postgres';

export class DatabaseServer extends SkeletonServer {
    public readonly sql: any;

    constructor(
            public readonly config: Config,
            public readonly logger: Logger,
            public readonly engine: Engine,
            public readonly provider: NearProvider) {
        super();
        this.sql = postgres(config.database);
        this._init();
    }

    async _init(): Promise<void> {
        await this.sql.listen('block', (payload: string) => {
            const blockID = parseInt(payload);
            if (isNaN(blockID)) return; // ignore UFOs

            this.logger.info({ block: { id: blockID } }, "block received");

            // TODO: notify subscribers
        });
    }

    // TODO
}
