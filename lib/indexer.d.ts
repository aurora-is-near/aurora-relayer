import { Config } from './config.js';
import { pg } from './database.js';
import { AccountID, BlockHeight, Engine, NetworkConfig } from '@aurora-is-near/engine';
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
    blockData(blockID: BlockHeight): Promise<any>;
    transactionData(blockID: BlockHeight, transactionIndex: number, transaction: any): Promise<any>;
    toSql(blockData: any): Promise<string>;
    insert(blockData: any): Promise<void>;
    delay(ms: number): Promise<unknown>;
    insertNewHeads(): Promise<void>;
    notifyNewHeads(blockID: number, blockData: any): Promise<void>;
}
export {};
