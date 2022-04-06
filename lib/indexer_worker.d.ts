import { Config } from './config.js';
import { pg } from './database.js';
import { AccountID, BlockHeight, Engine, LogEvent, LogEventWithAddress, NetworkConfig } from '@aurora-is-near/engine';
interface PendingBlocks {
    [key: number]: string;
}
export declare class Indexer {
    readonly config: Config;
    readonly network: NetworkConfig;
    readonly engine: Engine;
    protected readonly contractID: AccountID;
    protected readonly pgClient: pg.Client;
    protected pendingHeadBlock: number;
    protected pendingBlocks: PendingBlocks;
    constructor(config: Config, network: NetworkConfig, engine: Engine);
    start(): Promise<void>;
    indexBlock(blockID: BlockHeight): Promise<any>;
    indexTransaction(blockID: BlockHeight, transactionIndex: number, transaction: any): Promise<any>;
    indexEvent(blockID: BlockHeight, transactionIndex: number, eventIndex: number, event: LogEventWithAddress | LogEvent): Promise<any>;
    insertNewHeads(): Promise<void>;
    notifyNewHeads(blockID: number, blockData: any): Promise<void>;
    insert(blockData: any): Promise<void>;
    delay(ms: number): Promise<unknown>;
}
export {};
