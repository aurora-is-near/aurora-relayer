import { Config } from './config.js';
import { pg } from './database.js';
import { AccountID, BlockHeight, ConnectEnv, Engine, LogEvent, NetworkConfig, Transaction } from '@aurora-is-near/engine';
declare global {
    namespace NodeJS {
        interface ProcessEnv extends ConnectEnv {
        }
    }
}
export declare class Indexer {
    readonly config: Config;
    readonly network: NetworkConfig;
    readonly engine: Engine;
    protected readonly contractID: AccountID;
    protected readonly pgClient: pg.Client;
    constructor(config: Config, network: NetworkConfig, engine: Engine);
    start(): Promise<void>;
    indexBlock(blockID: BlockHeight): Promise<void>;
    indexTransaction(blockID: BlockHeight, transactionIndex: number, transaction: Transaction): Promise<void>;
    indexEvent(blockID: BlockHeight, transactionIndex: number, transactionID: number, eventIndex: number, event: LogEvent): Promise<void>;
}
