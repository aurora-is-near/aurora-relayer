import { SkeletonServer } from './skeleton.js';
import { Config } from '../config.js';
import { NearProvider } from '../provider.js';
import { Engine } from '@aurora-is-near/engine';
export declare class DatabaseServer extends SkeletonServer {
    readonly engine: Engine;
    readonly provider: NearProvider;
    readonly config: Config;
    readonly sql: any;
    constructor(engine: Engine, provider: NearProvider, config: Config);
}
