import { Config } from './config.js';
import { pg } from './database.js';
import { BlockHeight, ConnectEnv, Engine, LogEvent, LogEventWithAddress, NetworkConfig, Transaction } from '@aurora-is-near/engine';
import { Logger } from 'pino';
export declare class Indexer {
    readonly config: Config;
    readonly network: NetworkConfig;
    readonly logger: Logger;
    readonly engine: Engine;
    protected readonly pgClient: pg.Client;
    protected blockID: number;
    constructor(config: Config, network: NetworkConfig, logger: Logger, engine: Engine);
    start(blockID?: number, mode?: string): Promise<void>;
    indexBlock(blockID: BlockHeight): Promise<void>;
    indexTransaction(blockID: BlockHeight, transactionIndex: number, transaction: Transaction): Promise<void>;
    indexEvent(blockID: BlockHeight, transactionIndex: number, transactionID: number, eventIndex: number, event: LogEventWithAddress | LogEvent): Promise<void>;
}
declare global {
    namespace NodeJS {
        interface ProcessEnv extends ConnectEnv {
        }
    }
}
