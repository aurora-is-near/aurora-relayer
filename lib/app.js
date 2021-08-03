/* This is free and unencumbered software released into the public domain. */
import { ExpectedError } from './errors.js';
import middleware from './middleware.js';
import { DatabaseServer } from './servers/database.js';
import { EphemeralServer } from './servers/ephemeral.js';
import { SkeletonServer } from './servers/skeleton.js';
import { bytesToHex } from '@aurora-is-near/engine';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import jayson from 'jayson';
export { Engine } from '@aurora-is-near/engine';
//import { assert } from 'node:console';
export async function createApp(config, logger, engine) {
    const app = express();
    app.disable('x-powered-by');
    app.use(middleware.setRequestID());
    app.use(middleware.blacklistIPs(config));
    app.use(bodyParser.json({ type: 'application/json' }));
    app.use(middleware.logger(logger));
    app.use(cors()); // Access-Control-Allow-Origin: *
    app.get('/health', (req, res) => {
        res.send('OK');
    });
    app.get('/metrics', (req, res) => {
        res.send(''); // TODO
    });
    app.use(createServer(config, logger, engine));
    app.use(middleware.handleErrors());
    return app;
}
class Method extends jayson.Method {
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
        const result = this.handler.call(this.server, ...args);
        result
            .then((value) => callback(undefined, value))
            .catch((error) => {
            const metadata = {
                host: (request && request.headers.host) || undefined,
                'cf-ray': (request && request.headers['cf-ray']) || undefined,
                'cf-request-id': (request && request.headers['cf-request-id']) || undefined,
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
function createServer(config, logger, engine) {
    const serverClass = config.database ? DatabaseServer : EphemeralServer;
    const server = new serverClass(config, logger, engine);
    const methodList = Object.getOwnPropertyNames(SkeletonServer.prototype)
        .filter((id) => id !== 'constructor' && id[0] != '_')
        .map((id) => [id, server[id]]);
    const methodMap = Object.fromEntries(methodList);
    const jaysonServer = new jayson.Server(methodMap, {
        methodConstructor: Method,
        useContext: server,
    });
    return rpcMiddleware(jaysonServer);
}
function rpcMiddleware(server) {
    return function (req, res) {
        const options = server.options;
        if ((req.method || '') != 'POST') {
            return error(405, { Allow: 'POST' });
        }
        if (!RegExp('application/json', 'i').test((req || { headers: {} }).headers['content-type'] || '')) {
            return error(415);
        }
        //assert(req.body && typeof req.body === 'object');
        server.call(req.body, req, function (error, success) {
            const response = error || success;
            const body = JSON.stringify(response);
            if (!body) {
                res.writeHead(204);
            }
            else {
                const headers = {
                    'Content-Length': Buffer.byteLength(body, options.encoding),
                    'Content-Type': 'application/json; charset=utf-8',
                };
                res.writeHead(200, headers);
                res.write(body);
            }
            res.end();
        });
        function error(code, headers) {
            res.writeHead(code, headers || {});
            res.end();
        }
    };
}
// function response(id: string, result: any, error: any) {
//   const resp = { jsonrpc: '2.0', id };
//   if (error) {
//     Object.assign(resp, { error });
//   } else {
//     Object.assign(resp, { result });
//   }
//   return resp;
// }
