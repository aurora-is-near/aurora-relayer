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
const sendRawTransactionMetaData = ({ code, details, transactionResult, errorExists, }) => {
    const metadata = {};
    if (details.gasBurned) {
        metadata.neargas = details.gasBurned;
    }
    if (details.tx) {
        metadata.tx = details.tx;
    }
    if (transactionResult) {
        metadata.result = transactionResult;
    }
    if (errorExists && code) {
        metadata.error = code;
    }
    return metadata;
};
const handleResponse = ({ body, res, req, response, options, sendRawTransactionExists, }) => {
    if (!body) {
        res.writeHead(204);
    }
    else {
        const headers = {
            'Content-Type': 'application/json; charset=utf-8',
        };
        if (sendRawTransactionExists &&
            Array.isArray(req?.body) &&
            Array.isArray(response)) {
            const processResultHeader = response.reduce((acc, transaction) => {
                const transactionRequest = req.body.find((transactionRequest) => transactionRequest.id === transaction.id);
                let metadata = {};
                if (transactionRequest.method === 'eth_sendRawTransaction') {
                    const { code, details } = parseTransactionDetails(transaction?.error?.message || transaction?.result);
                    if (typeof transaction?.error?.message === 'string') {
                        if (code) {
                            transaction.error.message = code;
                        }
                    }
                    else if (transaction?.result) {
                        transaction.result = code;
                    }
                    metadata = sendRawTransactionMetaData({
                        code,
                        details,
                        transactionResult: transaction?.result && code,
                        errorExists: typeof transaction?.error?.message === 'string',
                    });
                }
                acc.push(metadata);
                return acc;
            }, []);
            headers['X-Aurora-Process-Result'] = JSON.stringify(processResultHeader);
            body = JSON.stringify(response);
        }
        if (req?.body?.method == 'eth_sendRawTransaction') {
            const { code, details } = parseTransactionDetails(response?.error?.message || response?.result);
            const metadata = sendRawTransactionMetaData({
                code,
                details,
                transactionResult: response?.result && code,
                errorExists: typeof response?.error?.message === 'string',
            });
            headers['X-Aurora-Process-Result'] = JSON.stringify([metadata]);
            if (typeof response?.error?.message === 'string') {
                if (code) {
                    response.error.message = code;
                }
                body = JSON.stringify(response);
            }
            else if (response?.result) {
                response.result = code;
                body = JSON.stringify(response);
            }
        }
        headers['Content-Length'] = Buffer.byteLength(body, options.encoding);
        res.writeHead(200, headers);
        res.write(body);
    }
    res.end();
};
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
function rpcMiddleware(server) {
    return async function (req, res, next) {
        const options = server.options;
        if (req.headers['sec-websocket-key']) {
            return next();
        }
        if ((req.method || '') != 'POST') {
            return error(405, { Allow: 'POST' });
        }
        if (!RegExp('application/json', 'i').test((req || { headers: {} }).headers['content-type'] || '')) {
            return error(415);
        }
        const findRawTx = (element) => element.method == 'eth_sendRawTransaction';
        if (Array.isArray(req.body) && req.body.some(findRawTx)) {
            const parsedPayloads = req.body.map((element, index) => {
                return {
                    ...element,
                    aurora_req_position: index,
                    parsed: element.method === 'eth_sendRawTransaction' &&
                        parseRawTransaction(element.params[0]),
                };
            });
            parsedPayloads.sort((a, b) => a.parsed.nonce > b.parsed.nonce ? 1 : -1);
            const executedPayloads = await parsedPayloads.reduce(async (acc, element) => {
                const collection = await acc;
                const promise = new Promise((resolve) => {
                    server.call(element, req, function (error, success) {
                        const response = success || error;
                        response.aurora_req_position = element.aurora_req_position;
                        resolve(response);
                    });
                });
                const result = await promise;
                collection.push(result);
                return collection;
            }, Promise.resolve([]));
            executedPayloads.sort((a, b) => a.aurora_req_position > b.aurora_req_position ? 1 : -1);
            executedPayloads.forEach((payload) => {
                delete payload.aurora_req_position;
            });
            const body = JSON.stringify(executedPayloads);
            handleResponse({
                body,
                res,
                req,
                response: executedPayloads,
                options,
                sendRawTransactionExists: true,
            });
        }
        else {
            server.call(req.body, req, function (error, success) {
                const response = error || success;
                const body = JSON.stringify(response);
                handleResponse({
                    body,
                    res,
                    req,
                    response,
                    options,
                });
            });
        }
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
