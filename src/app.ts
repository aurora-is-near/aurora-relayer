/* This is free and unencumbered software released into the public domain. */

import { Config } from './config.js';
import { validateEIP712, encodeMetaCall } from './eip-712-helpers.js';
import { CodedError } from './errors.js';
import middleware from './middleware.js';
import { NearProvider } from './provider.js';
import { DatabaseServer } from './servers/database.js';
import { EphemeralServer } from './servers/ephemeral.js';
import { SkeletonServer } from './servers/skeleton.js';

import { Engine } from '@aurora-is-near/engine';
import bodyParser from 'body-parser';
import connect from 'connect';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import jayson from 'jayson';
import nearProvider from 'near-web3-provider';
//import { exit } from 'process';
import { Logger } from 'pino';

function response(id: string, result: any, error: any) {
    const resp = { jsonrpc: '2.0', id };
    if (error) {
        Object.assign(resp, { error });
    } else {
        Object.assign(resp, { result });
    }
    return resp;
}

export async function createApp(config: Config, logger: Logger, engine: Engine, provider: NearProvider): Promise<any> {
    const app = express();
    app.disable('x-powered-by');

    app.use(middleware.setRequestID());
    app.use(middleware.logger(logger));
    app.use(middleware.blacklistIPs(config));
    app.use(middleware.rateLimit(config));
    app.use(cors());           // Access-Control-Allow-Origin: *
    app.use(helmet.noSniff()); // X-Content-Type-Options: nosniff
    app.use(bodyParser.json({ type: 'application/json' }));
    app.use(createServer(config, logger, engine, provider));
    app.use(middleware.handleErrors());

    app.post('/relay', async (req, res) => {
        res.header('Content-Type', 'application/json');
        const data = req.body;
        if (!data.data || !data.signature || !validateEIP712(data.data, data.signature)) {
            res.send({ code: -32000, message: "Signature is invalid for given message" });
            return;
        }
        try {
            const result = await nearProvider.utils.rawFunctionCall(
                provider.account,
                provider.evm_contract,
                'meta_call',
                encodeMetaCall(data.data, data.signature),
                '10000000000000',
                '0'
            );
            if (config.verbose) {
                console.log(data.data, data.signature);
                console.log(result);
            }
            res.send(response(data.id, result, null));
        } catch (error) {
            res.send(response(data.id, null, {
                code: -32000,
                message: error.message,
            }));
        }
    });

    return app;
}

class Method extends jayson.Method {
    public readonly server;

    constructor(
        public handler?: jayson.MethodHandlerType,
        options?: jayson.MethodOptions) {
            super(handler, {});
            this.server = options?.useContext as any; // HACK
        }

    getHandler(): jayson.MethodHandlerType {
        return this.handler!;
    }

    setHandler(handler: jayson.MethodHandlerType) {
        this.handler = handler;
    }

    execute(server: jayson.Server, requestParams: jayson.RequestParamsLike, _context: any, callback: jayson.JSONRPCCallbackType): any {
        const args = (requestParams || []) as any[];
        const result: Promise<any> = (this.handler as any).call(this.server, ...args);
        result
            .then((value: any) => (callback as any)(undefined, value))
            .catch((error: any) => {
                console.error(error);
                const errorCode = (error instanceof CodedError) ? error.code : -32000;
                return (callback as any)(server.error(errorCode, error.message));
            });
        return null;
    }
}

interface MethodMap { [methodName: string]: jayson.MethodLike }

function createServer(config: Config, logger: Logger, engine: Engine, provider: NearProvider): connect.HandleFunction {
    const serverClass = config.database ? DatabaseServer : EphemeralServer;
    const server = new serverClass(config, logger, engine, provider);
    const methodList = Object.getOwnPropertyNames(SkeletonServer.prototype)
        .filter((id: string) => id !== 'constructor' && id[0] != '_')
        .map((id: string) => [id, (server as any)[id]]);
    const methodMap: MethodMap = Object.fromEntries(methodList);
    const jaysonServer = new jayson.Server(methodMap, { methodConstructor: Method, useContext: server as any });
    return jaysonServer.middleware();
}
