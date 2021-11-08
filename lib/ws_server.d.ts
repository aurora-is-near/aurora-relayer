import { Config } from './config.js';
import { Engine } from '@aurora-is-near/engine';
import { Logger } from 'pino';
export declare function createWsServer(config: Config, logger: Logger, engine: Engine, app: any): Boolean;
