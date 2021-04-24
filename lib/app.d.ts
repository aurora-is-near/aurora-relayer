import { Config } from './config.js';
import { NearProvider } from './provider.js';
import { Engine } from '@aurora-is-near/engine';
import { Logger } from 'pino';
export declare function createApp(config: Config, logger: Logger, engine: Engine, provider: NearProvider): Promise<any>;
