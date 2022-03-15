/* This is free and unencumbered software released into the public domain. */
import { createServer } from './server.js';
import pg from 'pg';
import expressWs from 'express-ws';
import { exportJSON } from '@aurora-is-near/engine';
const syncInterval = 3000;
export async function createWsServer(config, logger, engine, app) {
    // const pgPool = new pg.Pool({ "connectionString": config.database });
    const pgClient = new pg.Client(config.database);
    pgClient.connect();
    pgClient.query('DELETE FROM subscription');
    const jaysonWsServer = createServer(config, logger, engine);
    const expressWsApp = expressWs(app);
    expressWsApp.app.ws('/', function (ws, req) {
        ws.id = req.headers['sec-websocket-key'];
        ws.on('message', function (msg) {
            try {
                const parsedObject = JSON.parse(msg);
                jaysonWsServer.call(parsedObject, req, function (error, success) {
                    ws.send(JSON.stringify(error || success));
                });
            }
            catch (e) {
                ws.send('Invalid request');
            }
        });
        ws.on('close', function close() {
            pgClient.query('DELETE FROM subscription WHERE sec_websocket_key = $1', [
                ws.id,
            ]);
        });
        ws.on('error', ws.send);
    });
    // Listen to new block notifications:
    pgClient.on('notification', (message) => {
        if (!message.payload)
            return;
        if (message.channel === 'block') {
            const blockID = parseInt(message.payload);
            if (isNaN(blockID))
                return; // ignore UFOs
            const body = {
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getBlockByNumber',
                params: [blockID, true],
            };
            jaysonWsServer.call(body, {}, function (error, success) {
                forSubscriptions(pgClient, 'newHeads', function (row) {
                    sendPayload(expressWsApp, row.ws_key, row.sub_id, error || success);
                });
            });
        }
        if (message.channel === 'log') {
            const parsedObject = JSON.parse(message.payload);
            const params = {
                fromBlock: parsedObject.blockId,
                toBlock: parsedObject.blockId,
                index: parsedObject.index,
            };
            const body = {
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getLogs',
                params: [params],
            };
            jaysonWsServer.call(body, {}, function (error, success) {
                forSubscriptions(pgClient, 'logs', function (row) {
                    const address = parseAddresses(row.filter?.address);
                    const topics = row.filter?.topics?.reduce((accumulator, value) => accumulator.concat(value), []) || null;
                    let result = success.result;
                    if (address) {
                        result = result.filter((result) => {
                            return address.includes(result.address);
                        });
                    }
                    if (topics) {
                        result = result.filter((result) => {
                            return (result.topics.filter((topic) => {
                                return topics.includes(topic);
                            }).length > 0);
                        });
                    }
                    result.forEach(function (res) {
                        sendPayload(expressWsApp, row.ws_key, row.sub_id, {
                            ...success,
                            ...{ result: res },
                        });
                    });
                });
            });
        }
        // NOT SUPPORTED YET
        if (message.channel === 'transaction') {
            // const payload = { result: message.payload}
            // forSubscriptions(pgClient, 'newPendingTransactions', function (row: any){
            //   sendPayload(expressWsApp, row.ws_key, row.sub_id, payload)
            // })
        }
    });
    await pgClient.query('LISTEN block');
    // pgClient.query('LISTEN transaction');
    await pgClient.query('LISTEN log');
    setTimeout(sync, syncInterval, pgClient, expressWsApp);
    return true;
}
async function sync(pgClient, expressWsApp, blockNumber) {
    const maxIdResult = await pgClient.query('SELECT MAX(id)::int AS max_id FROM block');
    const maxID = maxIdResult.rows[0].max_id || 0;
    forSubscriptions(pgClient, 'syncing', function (row) {
        const payload = {
            jsonrpc: '2.0',
            subscription: row.sub_id,
            result: { syncing: maxID > blockNumber },
        };
        sendPayload(expressWsApp, row.ws_key, row.sub_id, JSON.stringify(payload));
    });
    setTimeout(sync, syncInterval, pgClient, expressWsApp, maxID);
}
function sendPayload(express, ws_key, subId, payload) {
    express.getWss().clients.forEach(function (client) {
        if (ws_key == client.id) {
            typeof payload === 'string'
                ? client.send(payload)
                : client.send(wsResponse(payload, subId));
        }
    });
}
function wsResponse(rpcResponse, clientId) {
    const response = {
        jsonrpc: '2.0',
        method: 'eth_subscription',
        params: {
            result: rpcResponse.result,
            subscription: clientId,
        },
    };
    return JSON.stringify(exportJSON(response));
}
function forSubscriptions(pgClient, subscriptionType, callback) {
    pgClient
        .query(`SELECT sec_websocket_key AS ws_key, id AS sub_id, filter FROM subscription WHERE type = $1`, [subscriptionType])
        .then(function (pgResult) {
        pgResult.rows.forEach(callback);
    });
}
function parseAddresses(inputs) {
    return (Array.isArray(inputs) ? inputs : [inputs]).map((input) => {
        return input?.id?.toLowerCase() || null;
    });
}
