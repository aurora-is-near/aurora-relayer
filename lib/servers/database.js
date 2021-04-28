/* This is free and unencumbered software released into the public domain. */
import { SkeletonServer } from './skeleton.js';
//import { unimplemented } from '../errors.js';
import { compileTopics } from '../topics.js';
import { Address, bytesToHex, exportJSON, hexToBytes, intToHex } from '@aurora-is-near/engine';
import postgres from 'postgres';
import sql from 'sql-bricks';
const sqlConvert = sql.convert;
sql.convert = (val) => {
    if (val instanceof Uint8Array) {
        return `'\\x${Buffer.from(val).toString('hex')}'`;
    }
    return sqlConvert(val);
};
export class DatabaseServer extends SkeletonServer {
    async _init() {
        this.sql = postgres(this.config.database, {
            transform: {
                value: ((value) => {
                    // Fix BYTEA elements in arrays being returned as ['\\x...'] instead of [Buffer]:
                    if (Array.isArray(value)) {
                        return value.map((element) => {
                            return (typeof element === 'string' && element.startsWith('\\x')) ?
                                Buffer.from(element.slice(2), 'hex') : element;
                        });
                    }
                    return value;
                })
            },
        });
        await this.sql.listen('block', (payload) => {
            const blockID = parseInt(payload);
            if (isNaN(blockID))
                return; // ignore UFOs
            this.logger.info({ block: { id: blockID } }, "block received");
            // TODO: notify subscribers
        });
    }
    async eth_blockNumber() {
        const [{ result }] = await this.sql `SELECT eth_blockNumber() AS result`;
        return intToHex(result);
    }
    async eth_getFilterChanges(filterID) {
        const filterID_ = parseInt(filterID, 16);
        if (filterID_ === 0) {
            return [];
        }
        const [{ type }] = await this.sql `SELECT type FROM filter WHERE id = ${filterID_}`;
        switch (type) {
            case 'block': {
                const rows = await this.sql `SELECT * FROM eth_getFilterChanges_block(${filterID_}::bigint)`;
                return rows.flatMap((row) => Object.values(row)).map(bytesToHex);
            }
            case 'event': {
                const rows = await this.sql `SELECT * FROM eth_getFilterChanges_event(${filterID_}::bigint)`;
                return exportJSON(rows);
            }
            case 'transaction':
            default: return [];
        }
    }
    async eth_getFilterLogs(filterID) {
        const filterID_ = parseInt(filterID, 16);
        if (filterID_ === 0) {
            return [];
        }
        const [{ type }] = await this.sql `SELECT type FROM filter WHERE id = ${filterID_}`;
        switch (type) {
            case 'block': {
                const rows = await this.sql `SELECT * FROM eth_getFilterLogs_block(${filterID_}::bigint)`;
                return rows.flatMap((row) => Object.values(row)).map(bytesToHex);
            }
            case 'event': {
                const rows = await this.sql `SELECT * FROM eth_getFilterLogs_event(${filterID_}::bigint)`;
                return exportJSON(rows);
            }
            case 'transaction':
            default: return [];
        }
    }
    async eth_getLogs(filter) {
        const [{ id: latestBlockID }] = await this.sql `SELECT eth_blockNumber() AS id`;
        const where = [];
        if (filter.blockHash !== undefined && filter.blockHash !== null) { // EIP-234
            where.push({ 'b.hash': hexToBytes(filter.blockHash) });
        }
        else {
            const fromBlock = resolveBlockSpec(latestBlockID, filter.fromBlock);
            if (fromBlock) {
                where.push(sql.gte('b.id', fromBlock));
            }
            const toBlock = resolveBlockSpec(latestBlockID, filter.toBlock);
            if (toBlock) {
                where.push(sql.lte('b.id', toBlock));
            }
        }
        if (filter.address) {
            const addresses = (Array.isArray(filter.address) ? filter.address : [filter.address])
                .map((address) => Address.parse(address).unwrap());
            where.push(sql.in('t.from', addresses.map((address) => address.toBytes())));
        }
        if (filter.topics) {
            const clauses = compileTopics(filter.topics);
            if (clauses) {
                where.push(clauses);
            }
        }
        const query = sql.select('e.*').from('event e')
            .leftJoin('transaction t', { 'e.transaction': 't.id' })
            .leftJoin('block b', { 't.block': 'b.id' })
            .where(sql.and(...where));
        console.debug(query.toString()); // TODO: execute query
        return [];
    }
    async eth_newBlockFilter() {
        const [{ id }] = await this.sql `SELECT eth_newBlockFilter(${'0.0.0.0'}) AS id`; // TODO: IPv4
        return intToHex(id);
    }
}
function resolveBlockSpec(latestBlockID, blockSpec) {
    if (blockSpec === undefined || blockSpec === null) {
        return latestBlockID;
    }
    switch (blockSpec) {
        case 'earliest': return 0;
        case 'latest': return latestBlockID;
        case 'pending': return latestBlockID;
        default: {
            const blockID = parseInt(blockSpec, 16);
            if (isNaN(blockID)) {
                throw Error(`invalid block ID: ${blockSpec}`);
            }
            return blockID;
        }
    }
}
