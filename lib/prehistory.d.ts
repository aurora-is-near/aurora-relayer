import { Config } from './config.js';
import { ConnectEnv, NetworkConfig } from '@aurora-is-near/engine';
import pg from 'pg';
import { Logger } from 'pino';
interface BlockRow {
    chain: number;
    id: number;
    hash: Uint8Array;
    near_hash: Uint8Array | null;
    timestamp: Date | null;
    size: number;
    gas_limit: number;
    gas_used: number;
    parent_hash: Uint8Array;
    transactions_root: Uint8Array;
    state_root: Uint8Array;
    receipts_root: Uint8Array;
}
declare global {
    namespace NodeJS {
        interface ProcessEnv extends ConnectEnv {
        }
    }
}
export declare class PrehistoryIndexer {
    readonly config: Config;
    readonly network: NetworkConfig;
    readonly logger: Logger;
    protected readonly archive: pg.Client;
    protected blockID: number;
    constructor(config: Config, network: NetworkConfig, logger: Logger);
    run(startBlockID: number, mode?: string): Promise<void>;
    serialize(query: BlockRow): string;
}
export {};
