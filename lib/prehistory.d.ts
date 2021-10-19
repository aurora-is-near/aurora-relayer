import { Config } from './config.js';
import { ConnectEnv, NetworkConfig } from '@aurora-is-near/engine';
import pg from 'pg';
import { Logger } from 'pino';
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
    start(blockID: number, mode?: string): Promise<void>;
    serialize(query: any): any;
}
