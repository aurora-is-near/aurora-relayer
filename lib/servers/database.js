/* This is free and unencumbered software released into the public domain. */
import { SkeletonServer } from './skeleton.js';
//import { unimplemented } from '../errors.js';
import { intToHex } from '@aurora-is-near/engine';
//import { Address, BlockOptions, Engine, formatU256, hexToBase58, hexToBytes, intToHex } from '@aurora-is-near/engine';
import postgres from 'postgres';
export class DatabaseServer extends SkeletonServer {
    async _init() {
        this.sql = postgres(this.config.database);
        await this.sql.listen('block', (payload) => {
            const blockID = parseInt(payload);
            if (isNaN(blockID))
                return; // ignore UFOs
            this.logger.info({ block: { id: blockID } }, "block received");
            // TODO: notify subscribers
        });
    }
    async eth_getFilterChanges(filterID) {
        const filterID_ = parseInt(filterID, 16);
        if (filterID_ === 0) {
            return [];
        }
        return []; // TODO
    }
    async eth_newBlockFilter() {
        const [{ id }] = await this.sql `SELECT eth_newBlockFilter(${'0.0.0.0'}) AS id`;
        return intToHex(id);
    }
}
