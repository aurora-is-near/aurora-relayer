import { SkeletonServer } from './skeleton.js';
import { Config } from '../config.js';
import { NearProvider } from '../provider.js';
import { Engine } from '@aurora-is-near/engine';
import { Logger } from 'pino';
export declare class DatabaseServer extends SkeletonServer {
    readonly config: Config;
    readonly logger: Logger;
    readonly engine: Engine;
    readonly provider: NearProvider;
    readonly sql: any;
    constructor(config: Config, logger: Logger, engine: Engine, provider: NearProvider);
    _init(): Promise<void>;
}
