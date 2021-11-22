import { Config } from './config.js';
import { pg } from './database.js';
import { AccountID, BlockHeight, Engine, LogEvent, LogEventWithAddress, NetworkConfig, Transaction } from '@aurora-is-near/engine';
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
    indexEvent(blockID: BlockHeight, transactionIndex: number, transactionID: number, eventIndex: number, event: LogEventWithAddress | LogEvent): Promise<void>;
}
