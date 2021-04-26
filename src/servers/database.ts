/* This is free and unencumbered software released into the public domain. */

import { SkeletonServer } from './skeleton.js';

import * as api from '../api.js';
//import { unimplemented } from '../errors.js';

import { bytesToHex, intToHex } from '@aurora-is-near/engine';
import postgres from 'postgres';

export class DatabaseServer extends SkeletonServer {
    protected sql: any;

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

        const rows = await this.sql`SELECT * FROM eth_getFilterChanges_newBlockFilter(${ filterID_ }::bigint)`;
        return rows.flatMap((row: Record<string, unknown>) => Object.values(row)).map(bytesToHex);

        // TODO: support log filters
    }

    async eth_newBlockFilter(): Promise<api.Quantity> {
        const [{ id }] = await this.sql`SELECT eth_newBlockFilter(${'0.0.0.0'}) AS id`; // TODO: IPv4
        return intToHex(id);
    }

    // TODO: implement all RPC methods
}
