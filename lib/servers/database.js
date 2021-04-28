/* This is free and unencumbered software released into the public domain. */
import { SkeletonServer } from './skeleton.js';
//import { unimplemented } from '../errors.js';
import { compileTopics } from '../topics.js';
import { Address, bytesToHex, exportJSON, hexToBytes, intToHex } from '@aurora-is-near/engine';
import pg from 'pg';
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
        pg.types.setTypeParser(pg.types.builtins.INT8, (val) => BigInt(val));
        this.sql = new pg.Client(this.config.database);
        await this.sql.connect();
        this.sql.on('notification', (message) => {
            if (!message.payload)
                return;
            if (message.channel === 'block') {
                const blockID = parseInt(message.payload);
                if (isNaN(blockID))
                    return; // ignore UFOs
                this.logger.info({ block: { id: blockID } }, "block received");
                // TODO: notify subscribers
            }
        });
        this.sql.query('LISTEN block');
    }
    async eth_accounts() {
        return [];
    }
    async eth_blockNumber() {
        const { rows: [{ result }] } = await this.sql.query('SELECT eth_blockNumber()::int AS result');
        return intToHex(result);
    }
    async eth_call(transaction, blockNumber) {
        return super.eth_call(transaction, blockNumber); // TODO
    }
    async eth_chainId() {
        const chainID = (await this.engine.getChainID()).unwrap();
        return intToHex(chainID);
    }
    async eth_coinbase() {
        return (await this.engine.getCoinbase()).unwrap().toString();
    }
    async eth_getBalance(address, blockNumber) {
        const address_ = Address.parse(address).unwrap();
        const balance = (await this.engine.getBalance(address_)).unwrap();
        return intToHex(balance);
    }
    async eth_getBlockByHash(blockHash, fullObject) {
        return super.eth_getBlockByHash(blockHash, fullObject); // TODO
    }
    async eth_getBlockByNumber(blockNumber, fullObject) {
        return super.eth_getBlockByNumber(blockNumber); // TODO
    }
    async eth_getBlockTransactionCountByHash(blockHash) {
        return super.eth_getBlockTransactionCountByHash(blockHash); // TODO
    }
    async eth_getBlockTransactionCountByNumber(blockNumber) {
        return super.eth_getBlockTransactionCountByNumber(blockNumber); // TODO
    }
    async eth_getCode(address, blockNumber) {
        return super.eth_getCode(address, blockNumber); // TODO
    }
    async eth_getFilterChanges(filterID) {
        const filterID_ = parseInt(filterID, 16);
        if (filterID_ === 0) {
            return [];
        }
        const { rows: [{ type }] } = await this.sql.query('SELECT type FROM filter WHERE id = $1', [filterID_]);
        switch (type) {
            case 'block': {
                const { rows } = await this.sql.query('SELECT * FROM eth_getFilterChanges_block($1::bigint)', [filterID_]);
                const buffers = rows.flatMap((row) => Object.values(row));
                return buffers.map(bytesToHex);
            }
            case 'event': {
                const { rows } = await this.sql.query('SELECT * FROM eth_getFilterChanges_event($1::bigint)', [filterID_]);
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
        console.log(sql.select('type').from('filter').where({ 'id': filterID_ }).toParams());
        const { rows: [{ type }] } = await this.sql.query('SELECT type FROM filter WHERE id = $1', [filterID_]);
        switch (type) {
            case 'block': {
                const { rows } = await this.sql.query('SELECT * FROM eth_getFilterLogs_block($1::bigint)', [filterID_]);
                const buffers = rows.flatMap((row) => Object.values(row));
                return buffers.map(bytesToHex);
            }
            case 'event': {
                const { rows } = await this.sql.query('SELECT * FROM eth_getFilterLogs_event($1::bigint)', [filterID_]);
                return exportJSON(rows);
            }
            case 'transaction':
            default: return [];
        }
    }
    async eth_getLogs(filter) {
        const { rows: [{ id: latestBlockID }] } = await this.sql.query('SELECT eth_blockNumber()::int AS id');
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
        const query = sql.select('b.id AS "blockNumber"', 'b.hash AS "blockHash"', '0 AS "transactionIndex"', // TODO
        't.hash AS "transactionHash"', '0 AS "logIndex"', // TODO
        't.from AS "address"', // FIXME
        'e.topics AS "topics"', 'e.data AS "data"', '0::boolean AS "removed"')
            .from('event e')
            .leftJoin('transaction t', { 'e.transaction': 't.id' })
            .leftJoin('block b', { 't.block': 'b.id' })
            .where(sql.and(...where));
        if (this.config.debug) {
            console.debug('eth_getLogs', 'query:', query.toParams());
            console.debug('eth_getLogs', 'query:', query.toString());
        }
        const { rows } = await this.sql.query(query.toParams());
        if (this.config.debug) {
            console.debug('eth_getLogs', 'result:', rows);
        }
        return exportJSON(rows);
    }
    async eth_getStorageAt(address, key, blockNumber) {
        return super.eth_getStorageAt(address, key, blockNumber); // TODO
    }
    async eth_getTransactionByBlockHashAndIndex(blockHash, transactionIndex) {
        return super.eth_getTransactionByBlockHashAndIndex(blockHash, transactionIndex); // TODO
    }
    async eth_getTransactionByBlockNumberAndIndex(blockNumber, transactionIndex) {
        return super.eth_getTransactionByBlockNumberAndIndex(blockNumber, transactionIndex); // TODO
    }
    async eth_getTransactionByHash(transactionHash) {
        return super.eth_getTransactionByHash(transactionHash); // TODO
    }
    async eth_getTransactionCount(address, blockNumber) {
        return super.eth_getTransactionCount(address, blockNumber); // TODO
    }
    async eth_getTransactionReceipt(transactionHash) {
        return super.eth_getTransactionReceipt(transactionHash); // TODO
    }
    async eth_getUncleCountByBlockHash(blockHash) {
        return super.eth_getUncleCountByBlockHash(blockHash); // TODO
    }
    async eth_getUncleCountByBlockNumber(blockNumber) {
        return super.eth_getUncleCountByBlockNumber(blockNumber); // TODO
    }
    async eth_newBlockFilter() {
        const { rows: [{ id }] } = await this.sql.query('SELECT eth_newBlockFilter($1)::int AS id', ['0.0.0.0']); // TODO: IPv4
        return intToHex(id);
    }
    async eth_newFilter(filter) {
        return super.eth_newFilter(filter); // TODO
    }
    async eth_newPendingTransactionFilter() {
        return intToHex(0); // designates the empty filter
    }
    async eth_sendRawTransaction(transaction) {
        return super.eth_sendRawTransaction(transaction); // TODO
    }
    async eth_sendTransaction(transaction) {
        return super.eth_sendTransaction(transaction); // TODO
    }
    async eth_sign(account, message) {
        return super.eth_sign(account, message); // TODO
    }
    async eth_signTransaction(transaction) {
        return super.eth_signTransaction(transaction); // TODO
    }
    async eth_signTypedData(address, data) {
        return super.eth_signTypedData(address, data); // TODO
    }
    async eth_uninstallFilter(filterID) {
        return super.eth_uninstallFilter(filterID); // TODO
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
