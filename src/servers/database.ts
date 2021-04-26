/* This is free and unencumbered software released into the public domain. */

import { SkeletonServer } from './skeleton.js';

import * as api from '../api.js';
//import { unimplemented } from '../errors.js';

import { bytesToHex, exportJSON, intToHex } from '@aurora-is-near/engine';
import postgres from 'postgres';

export class DatabaseServer extends SkeletonServer {
    protected sql: any;

    async _init(): Promise<void> {
        this.sql = postgres(this.config.database, {
            transform: {
                value: ((value: unknown) => {
                    // Fix BYTEA elements in arrays being returned as ['\\x...'] instead of [Buffer]:
                    if (Array.isArray(value)) {
                        return value.map((element: unknown) => {
                            return (typeof element === 'string' && element.startsWith('\\x')) ?
                                Buffer.from(element.slice(2), 'hex') : element;
                        });
                    }
                    return value;
                })
            },
        });
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

        const [{ type }] = await this.sql`SELECT type FROM filter WHERE id = ${ filterID_ }`;
        switch (type) {
            case 'block': {
                const rows = await this.sql`SELECT * FROM eth_getFilterChanges_block(${ filterID_ }::bigint)`;
                return rows.flatMap((row: Record<string, unknown>) => Object.values(row)).map(bytesToHex);
            }
            case 'event': {
                const rows = await this.sql`SELECT * FROM eth_getFilterChanges_event(${ filterID_ }::bigint)`;
                return exportJSON(rows);
            }
            case 'transaction':
            default: return [];
        }
    }

    async eth_getFilterLogs(filterID: api.Quantity): Promise<api.LogObject[]> {
        const filterID_ = parseInt(filterID, 16);
        if (filterID_ === 0) {
            return [];
        }

        const [{ type }] = await this.sql`SELECT type FROM filter WHERE id = ${ filterID_ }`;
        switch (type) {
            case 'block': {
                const rows = await this.sql`SELECT * FROM eth_getFilterLogs_block(${ filterID_ }::bigint)`;
                return rows.flatMap((row: Record<string, unknown>) => Object.values(row)).map(bytesToHex);
            }
            case 'event': {
                const rows = await this.sql`SELECT * FROM eth_getFilterLogs_event(${ filterID_ }::bigint)`;
                return exportJSON(rows);
            }
            case 'transaction':
            default: return [];
        }
    }

    async eth_newBlockFilter(): Promise<api.Quantity> {
        const [{ id }] = await this.sql`SELECT eth_newBlockFilter(${'0.0.0.0'}) AS id`; // TODO: IPv4
        return intToHex(id);
    }

    // TODO: implement all RPC methods
}
