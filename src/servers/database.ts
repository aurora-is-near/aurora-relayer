/* This is free and unencumbered software released into the public domain. */

import { SkeletonServer } from './skeleton.js';

import * as api from '../api.js';
//import { unimplemented } from '../errors.js';

//import { Address, BlockOptions, Engine, formatU256, hexToBase58, hexToBytes, intToHex } from '@aurora-is-near/engine';
import postgres from 'postgres';

export class DatabaseServer extends SkeletonServer {
    public sql: any;

    async _init(): Promise<void> {
        this.sql = postgres(this.config.database);
        await this.sql.listen('block', (payload: string) => {
            const blockID = parseInt(payload);
            if (isNaN(blockID)) return; // ignore UFOs

            this.logger.info({ block: { id: blockID } }, "block received");

            // TODO: notify subscribers
        });
    }

    async eth_getFilterChanges(filterID: api.Quantity): Promise<api.LogObject[]> {
        const filterID_ = parseInt(filterID, 16);
        if (filterID_ === 0) {
            return [];
        }
        return []; // TODO
    }

    async eth_newBlockFilter(): Promise<api.Quantity> {
        return `0x0`; // TODO
    }

    // TODO: implement all RPC methods
}
