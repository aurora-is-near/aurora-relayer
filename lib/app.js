/* This is free and unencumbered software released into the public domain. */
//import { validateEIP712, encodeMetaCall } from './eip-712-helpers.js';
import { ExpectedError } from './errors.js';
import middleware from './middleware.js';
import { DatabaseServer } from './servers/database.js';
import { EphemeralServer } from './servers/ephemeral.js';
import { SkeletonServer } from './servers/skeleton.js';
import { bytesToHex } from '@aurora-is-near/engine';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import jayson from 'jayson';
export { Engine } from '@aurora-is-near/engine';
export async function createApp(config, logger, engine, provider) {
    const app = express();
    app.disable('x-powered-by');
    app.use(middleware.setRequestID());
    app.use(middleware.blacklistIPs(config));
    app.use(bodyParser.json({ type: 'application/json' }));
    app.use(middleware.logger(logger));
    app.use(cors()); // Access-Control-Allow-Origin: *
    app.use(helmet.noSniff()); // X-Content-Type-Options: nosniff
    app.use(createServer(config, logger, engine, provider));
    app.use(middleware.handleErrors());
    // app.post('/relay', async (req, res) => {
    //   res.header('Content-Type', 'application/json');
    //   const data = req.body;
    //   if (
    //     !data.data ||
    //     !data.signature ||
    //     !validateEIP712(data.data, data.signature)
    //   ) {
    //     res.send({
    //       code: -32000,
    //       message: 'Signature is invalid for given message',
    //     });
    //     return;
    //   }
    //   try {
    //     const result = await nearProvider.utils.rawFunctionCall(
    //       provider.account,
    //       provider.evm_contract,
    //       'meta_call',
    //       encodeMetaCall(data.data, data.signature),
    //       '10000000000000',
    //       '0'
    //     );
    //     if (config.debug) {
    //       console.log(data.data, data.signature);
    //       console.log(result);
    //     }
    //     res.send(response(data.id, result, null));
    //   } catch (error) {
    //     res.send(
    //       response(data.id, null, {
    //         code: -32000,
    //         message: error.message,
    //       })
    //     );
    //   }
    // });
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
            const timestamp = Math.floor(Date.now() / 1000);
            if (error instanceof ExpectedError) {
                return callback(server.error(error.code, error.message, error.data
                    ? bytesToHex(error.data)
                    : { timestamp }));
            }
            if (this.server?.config?.debug) {
                console.error(error);
            }
            if (this.server?.logger) {
                this.server.logger.error(error);
            }
            return callback(server.error(-32603, 'Internal error, please report a bug at <https://github.com/aurora-is-near/aurora-relayer/issues>', { timestamp } // TODO: req.id
            ));
        });
        return null;
    }
}
function createServer(config, logger, engine, provider) {
    const serverClass = config.database ? DatabaseServer : EphemeralServer;
    const server = new serverClass(config, logger, engine, provider);
    const methodList = Object.getOwnPropertyNames(SkeletonServer.prototype)
        .filter((id) => id !== 'constructor' && id[0] != '_')
        .map((id) => [id, server[id]]);
    const methodMap = Object.fromEntries(methodList);
    const jaysonServer = new jayson.Server(methodMap, {
        methodConstructor: Method,
        useContext: server,
    });
    return jaysonServer.middleware({ end: true });
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
