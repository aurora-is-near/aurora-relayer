import { Config } from './config.js';
import { Engine } from '@aurora-is-near/engine';
import jayson from 'jayson';
import { Logger } from 'pino';
export declare function createServer(config: Config, logger: Logger, engine: Engine): jayson.Server;
