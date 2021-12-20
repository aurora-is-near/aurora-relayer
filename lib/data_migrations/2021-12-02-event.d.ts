import { Config } from '../config.js';
import { pg } from '../database.js';
import { AccountID, Engine, ConnectEnv, NetworkConfig } from '@aurora-is-near/engine';
import { Logger } from 'pino';
declare global {
    namespace NodeJS {
        interface ProcessEnv extends ConnectEnv {
        }
    }
}
export declare class ReindexWorker {
    readonly config: Config;
    readonly network: NetworkConfig;
    readonly logger: Logger;
    readonly engine: Engine;
    protected readonly contractID: AccountID;
    protected readonly pgClient: pg.Client;
    constructor(config: Config, network: NetworkConfig, logger: Logger, engine: Engine);
    run(startBlockId: number, mode?: string): Promise<void>;
}
