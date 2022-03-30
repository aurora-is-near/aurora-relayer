import { Config } from './config.js';
import { Engine } from '@aurora-is-near/engine';
import jayson from 'jayson/promise/index.js';
import { Logger } from 'pino';
export declare class Method extends jayson.Method {
    handler?: jayson.MethodHandlerType | undefined;
    readonly server: any;
    constructor(handler?: jayson.MethodHandlerType | undefined, options?: jayson.MethodOptions);
    getHandler(): jayson.MethodHandlerType;
    setHandler(handler: jayson.MethodHandlerType): void;
    execute(server: jayson.Server, requestParams: jayson.RequestParamsLike, request: any, // context
    callback: jayson.JSONRPCCallbackType): any;
}
export declare function createServer(config: Config, logger: Logger, engine: Engine): jayson.Server;
