/* This is free and unencumbered software released into the public domain. */
import middleware from './middleware.js';
import { createServer } from './server.js';
import { createWsServer } from './ws_server.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { parse as parseRawTransaction } from '@ethersproject/transactions';
export async function createApp(config, logger, engine) {
    const app = express();
    app.disable('x-powered-by');
    app.use(middleware.setRequestID());
    app.use(middleware.blacklistIPs());
    app.use(bodyParser.json({ type: 'application/json' }));
    app.use(middleware.logger(logger));
    app.use(cors()); // Access-Control-Allow-Origin: *
    app.get('/health', (req, res) => {
        res.send('OK');
    });
    app.get('/metrics', (req, res) => {
        res.send(''); // TODO
    });
    app.use(rpcMiddleware(createServer(config, logger, engine)));
    app.use(middleware.handleErrors());
    await createWsServer(config, logger, engine, app);
    return app;
}
function rpcMiddleware(server) {
    return async function (req, res) {
        const options = server.options;
        if (req.headers['sec-websocket-key']) {
            res.next();
        }
        if ((req.method || '') != 'POST') {
            return error(405, { Allow: 'POST' });
        }
        if (!RegExp('application/json', 'i').test((req || { headers: {} }).headers['content-type'] || '')) {
            return error(415);
        }
        const payloads = Array.isArray(req.body) ? req.body : [req.body];
        const findRawTx = (element) => element.method == 'eth_sendRawTransaction';
        if (payloads.some(findRawTx)) {
            const parsedPayloads = payloads.map((element) => {
                return {
                    ...element,
                    parsed: element.method === 'eth_sendRawTransaction' && parseRawTransaction(element.params[0])
                };
            });
            parsedPayloads.sort((a, b) => (a.parsed.nonce > b.parsed.nonce) ? 1 : -1);
            const executedPayloads = await parsedPayloads.reduce(async (acc, element) => {
                let array = await acc;
                const promise = new Promise((resolve, reject) => {
                    server.call(element, req, function (error, success) {
                        const response = success || error;
                        resolve(response);
                    });
                });
                const result = await promise;
                array.push(result);
                return array;
            }, Promise.resolve([]));
            let response = executedPayloads[executedPayloads.length - 1];
            let body = JSON.stringify(executedPayloads);
            if (!body) {
                res.writeHead(204);
            }
            else {
                const headers = {
                    'Content-Type': 'application/json; charset=utf-8',
                };
                if (req?.body?.method == 'eth_sendRawTransaction') {
                    const { code, details } = parseTransactionDetails(response?.error?.message || response?.result);
                    if (details.gasBurned) {
                        headers['X-NEAR-Gas-Burned'] = details.gasBurned;
                    }
                    if (details.tx) {
                        headers['X-NEAR-Transaction-ID'] = details.tx;
                    }
                    if (typeof response?.error?.message === 'string') {
                        if (code) {
                            headers['X-Aurora-Error-Code'] = code.replace(/[^a-zA-Z0-9!#$%&'*+\-.^_`|~ ]/g, '');
                        }
                        response.error.message = code;
                        body = JSON.stringify(response);
                    }
                    else if (response?.result) {
                        response.result = code;
                        headers['X-Aurora-Result'] = response.result;
                        body = JSON.stringify(response);
                    }
                }
                headers['Content-Length'] = Buffer.byteLength(body, options.encoding);
                res.writeHead(200, headers);
                res.write(body);
            }
            res.end();
        }
        else {
            server.call(req.body, req, function (error, success) {
                const response = error || success;
                let body = JSON.stringify(response);
                if (!body) {
                    res.writeHead(204);
                }
                else {
                    const headers = {
                        'Content-Type': 'application/json; charset=utf-8',
                    };
                    if (req?.body?.method == 'eth_sendRawTransaction') {
                        const { code, details } = parseTransactionDetails(response?.error?.message || success?.result);
                        if (details.gasBurned) {
                            headers['X-NEAR-Gas-Burned'] = details.gasBurned;
                        }
                        if (details.tx) {
                            headers['X-NEAR-Transaction-ID'] = details.tx;
                        }
                        if (typeof response?.error?.message === 'string') {
                            if (code) {
                                headers['X-Aurora-Error-Code'] = code.replace(/[^a-zA-Z0-9!#$%&'*+\-.^_`|~ ]/g, '');
                            }
                            response.error.message = code;
                            body = JSON.stringify(response);
                        }
                        else if (response?.result) {
                            response.result = code;
                            headers['X-Aurora-Result'] = response.result;
                            body = JSON.stringify(response);
                        }
                    }
                    headers['Content-Length'] = Buffer.byteLength(body, options.encoding);
                    res.writeHead(200, headers);
                    res.write(body);
                }
                res.end();
            });
        }
        function error(code, headers) {
            res.writeHead(code, headers || {});
            res.end();
        }
        function parseErrorDetails(details) {
            try {
                return JSON.parse(details);
            }
            catch (e) {
                return {};
            }
        }
        function parseTransactionDetails(message) {
            if (message === undefined) {
                return { code: message, details: {} };
            }
            let code = message;
            const sepIndex = code.lastIndexOf('|');
            if (sepIndex > -1) {
                code = message.substring(0, sepIndex);
                const details = parseErrorDetails(message.substring(sepIndex + 1));
                return { code: code, details: details };
            }
            else {
                return { code: code, details: {} };
            }
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
