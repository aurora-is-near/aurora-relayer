import { Config } from './config.js';
import { pg } from './database.js';
import { AccountID, BlockHeight, Engine, LogEvent, NetworkConfig, Transaction } from '@aurora-is-near/engine';
export declare class Indexer {
    readonly config: Config;
    readonly network: NetworkConfig;
    readonly engine: Engine;
    protected readonly contractID: AccountID;
    protected readonly pgClient: pg.Client;
    protected pendingHeadBlock: number;
    constructor(config: Config, network: NetworkConfig, engine: Engine);
    start(): Promise<void>;
    indexBlock(blockID: BlockHeight): Promise<void>;
    indexTransaction(blockID: BlockHeight, transactionIndex: number, transaction: Transaction): Promise<void>;
    indexEvent(blockID: BlockHeight, transactionIndex: number, transactionID: number, eventIndex: number, event: LogEvent): Promise<void>;
    notifyNewHeads(blockID: number): Promise<void>;
    isBlockIndexed(blockID: number): Promise<boolean>;
}
