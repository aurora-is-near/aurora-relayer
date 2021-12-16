/* This is free and unencumbered software released into the public domain. */
import { SkeletonServer } from './servers/skeleton.js';
import { DatabaseServer } from './servers/database.js';
import { Request } from './request.js';
import { ExpectedError } from './errors.js';
import { bytesToHex } from '@aurora-is-near/engine';
import jayson from 'jayson';
export class Method extends jayson.Method {
    constructor(handler, options) {
        super(handler, {});
        this.handler = handler;
        this.server = options?.useContext; // HACK
    }
    getHandler() {
        return this.handler;
    }
    setHandler(handler) {
        this.handler = handler;
    }
    execute(server, requestParams, request, // context
    callback) {
        const args = (requestParams || []);
        const result = this.handler.call(this.server, new Request(request), ...args);
        result
            .then((value) => callback(undefined, value))
            .catch((error) => {
            const metadata = {
                host: request?.headers?.host || undefined,
                'cf-ray': request?.headers['cf-ray'] || undefined,
                'cf-request-id': request?.headers['cf-request-id'] || undefined,
            };
            if (error instanceof ExpectedError) {
                return callback(server.error(error.code, error.message, error.data
                    ? bytesToHex(error.data)
                    : metadata));
            }
            if (this.server?.config?.debug) {
                console.error(error);
            }
            if (this.server?.logger) {
                this.server.logger.error(error);
            }
            return callback(server.error(-32603, `Internal Error - ${error.message}. Please report a bug at <https://github.com/aurora-is-near/aurora-relayer/issues>`, metadata));
        });
        return null;
    }
}
export function createServer(config, logger, engine) {
    const server = new DatabaseServer(config, logger, engine);
    const methodList = Object.getOwnPropertyNames(SkeletonServer.prototype)
        .filter((id) => id !== 'constructor' && id[0] != '_')
        .map((id) => [id, server[id]]);
    const methodMap = Object.fromEntries(methodList);
    const jaysonServer = new jayson.Server(methodMap, {
        methodConstructor: Method,
        useContext: server,
    });
    return jaysonServer;
}
