/* This is free and unencumbered software released into the public domain. */
import { validateEIP712, encodeMetaCall } from './eip-712-helpers.js';
import { CodedError } from './errors.js';
import { Server } from './server.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import expressRateLimit from 'express-rate-limit';
import helmet from 'helmet';
import jayson from 'jayson';
import nearProvider from 'near-web3-provider';
function response(id, result, error) {
    const resp = { jsonrpc: '2.0', id };
    if (error) {
        Object.assign(resp, { error });
    }
    else {
        Object.assign(resp, { result });
    }
    return resp;
}
export async function createApp(options, engine, provider) {
    const app = express();
    app.disable('x-powered-by');
    app.use(bodyParser.json({ type: 'application/json' }));
    app.use(cors());
    app.use(helmet.noSniff()); // X-Content-Type-Options: nosniff
    app.use(expressRateLimit({
        windowMs: 60 * 1000,
        max: 60,
        headers: false,
        draft_polli_ratelimit_headers: true,
        handler: (req, res) => {
            res.status(429)
                .set('Content-Type', 'text/plain')
                .send("Too many requests, please try again later.");
        },
    }));
    app.use(createServer(options, engine, provider));
    app.post('/relay', async (req, res) => {
        res.header('Content-Type', 'application/json');
        const data = req.body;
        if (!data.data || !data.signature || !validateEIP712(data.data, data.signature)) {
            res.send({ code: -32000, message: "Signature is invalid for given message" });
            return;
        }
        try {
            const result = await nearProvider.utils.rawFunctionCall(provider.account, provider.evm_contract, 'meta_call', encodeMetaCall(data.data, data.signature), '10000000000000', '0');
            if (options.verbose) {
                console.log(data.data, data.signature);
                console.log(result);
            }
            res.send(response(data.id, result, null));
        }
        catch (error) {
            res.send(response(data.id, null, {
                code: -32000,
                message: error.message,
            }));
        }
    });
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
    execute(server, requestParams, _context, callback) {
        const args = (requestParams || []);
        const result = this.handler.call(this.server, ...args);
        result
            .then((value) => callback(undefined, value))
            .catch((error) => {
            console.error(error);
            const errorCode = (error instanceof CodedError) ? error.code : -32000;
            return callback(server.error(errorCode, error.message));
        });
        return null;
    }
}
function createServer(options, engine, provider) {
    const server = new Server(engine, provider, options);
    const methodList = Object.getOwnPropertyNames(Server.prototype)
        .filter((id) => id !== 'constructor')
        .map((id) => [id, server[id]]);
    const methodMap = Object.fromEntries(methodList);
    const jaysonServer = new jayson.Server(methodMap, { methodConstructor: Method, useContext: server });
    return jaysonServer.middleware();
}
