import { Config } from './config.js';
import { Engine } from '@aurora-is-near/engine';
import { Logger } from 'pino';
export { Engine } from '@aurora-is-near/engine';
export declare function createApp(config: Config, logger: Logger, engine: Engine): Promise<any>;
