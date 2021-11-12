/* This is free and unencumbered software released into the public domain. */
import { createServer } from './server.js';
import pg from 'pg';
import expressWs from 'express-ws';
import { exportJSON } from '@aurora-is-near/engine';
export function createWsServer(config, logger, engine, app) {
    const pgClient = new pg.Client(config.database);
    pgClient.connect();
    const jaysonWsServer = createServer(config, logger, engine);
    const expressWsApp = expressWs(app);
    expressWsApp.app.ws("/", function (ws, req) {
        ws.id = req.headers['sec-websocket-key'];
        ws.on('message', function (msg) {
            try {
                const parsedObject = JSON.parse(msg);
                jaysonWsServer.call(parsedObject, { secWebsocketKey: req.headers['sec-websocket-key'], ip: req.socket.remoteAddress }, function (error, success) {
                    ws.send(JSON.stringify(error || success));
                });
            }
            catch (e) {
                ws.send('Invalid request');
            }
        });
        ws.on('close', function close() {
            pgClient.query("DELETE FROM subscription WHERE sec_websocket_key = $1", [ws.id]);
        });
        ws.on("error", (e) => ws.send(e));
        ws.send('Connection established');
    });
    // Listen to new block notifications:
    pgClient.on('notification', (message) => {
        if (!message.payload)
            return;
        if (message.channel === 'block') {
            const blockID = parseInt(message.payload);
            if (isNaN(blockID))
                return; // ignore UFOs
            const body = { "jsonrpc": "2.0", "id": 1, "method": "eth_getBlockByNumber", "params": [blockID, true] };
            jaysonWsServer.call(body, {}, function (error, success) {
                pgClient.query("SELECT COALESCE(array_agg(sec_websocket_key), '{}') AS wskeys, COALESCE(array_agg(id), '{}') AS subids FROM subscription WHERE type = 'newHeads'")
                    .then(function (sec_websocket_keys) {
                    expressWsApp.getWss().clients.forEach(function (client) {
                        let index = sec_websocket_keys.rows[0].wskeys.indexOf(client.id);
                        if (index > -1) {
                            client.send(wsResponse(error || success, sec_websocket_keys.rows[0].subids[index]));
                        }
                    });
                });
            });
        }
        if (message.channel === 'log') {
            const parsedObject = JSON.parse(message.payload);
            const params = { "fromBlock": parsedObject.blockId, "toBlock": parsedObject.blockId, "index": parsedObject.index };
            const body = { "jsonrpc": "2.0", "id": 1, "method": "eth_getLogs", "params": [params] };
            jaysonWsServer.call(body, {}, function (error, success) {
                pgClient.query("SELECT sec_websocket_key as wskey, filter, id AS subid FROM subscription WHERE type = 'logs'")
                    .then(function (result) {
                    result.rows.forEach(function (row) {
                        const address = (row.filter && row.filter.address && row.filter.address.id.toLowerCase()) || null;
                        const topics = (row.filter && row.filter.topics) || null;
                        if (address && address != success.result[0].address) {
                            // Skip delivery
                        }
                        else if (topics && topics.filter(function (x) { return success.result[0].topics.includes(x); }).length == 0) {
                            // Skip delivery
                        }
                        else {
                            expressWsApp.getWss().clients.forEach(function (client) {
                                if (row.wskey == client.id) {
                                    client.send(wsResponse(error || success, row.subid));
                                }
                            });
                        }
                    });
                });
            });
        }
        // How to determine if transaction is pending? is it by status column
        if (message.channel === 'transaction') {
            const parsedObject = JSON.parse(message.payload);
            const body = { "jsonrpc": "2.0", "id": 1, "method": "eth_getTransactionByBlockNumberAndIndex", "params": [parsedObject.blockId, parsedObject.index] };
            jaysonWsServer.call(body, {}, function (error, success) {
                pgClient.query("SELECT COALESCE(array_agg(sec_websocket_key), '{}') AS wskeys, COALESCE(array_agg(id), '{}') AS subids FROM subscription WHERE type = 'newPendingTransactions'")
                    .then(function (sec_websocket_keys) {
                    expressWsApp.getWss().clients.forEach(function (client) {
                        let index = sec_websocket_keys.rows[0].wskeys.indexOf(client.id);
                        if (index > -1) {
                            client.send(wsResponse(error || success, sec_websocket_keys.rows[0].subids[index]));
                        }
                    });
                });
            });
        }
    });
    pgClient.query('LISTEN block');
    pgClient.query('LISTEN transaction');
    pgClient.query('LISTEN log');
    setTimeout(sync, 1000, pgClient, expressWsApp);
    return true;
}
function wsResponse(rpcResponse, clientId) {
    const response = {
        "jsonrpc": "2.0",
        "method": "eth_subscription",
        "params": {
            "result": rpcResponse.result,
            "subscription": clientId
        }
    };
    return JSON.stringify(exportJSON(response));
}
function sync(pgClient, exspress, blockNumber) {
    pgClient.query('SELECT MAX(id)::int AS "maxID" FROM block').then(function (res) {
        pgClient.query("SELECT COALESCE(array_agg(sec_websocket_key), '{}') AS wskeys, COALESCE(array_agg(id), '{}') AS subids FROM subscription WHERE type = 'sync'")
            .then(function (sec_websocket_keys) {
            exspress.getWss().clients.forEach(function (client) {
                let index = sec_websocket_keys.rows[0].wskeys.indexOf(client.id);
                let syncing = res.rows[0].maxID > blockNumber;
                let payload = { "jsonrpc": "2.0", "subscription": sec_websocket_keys.rows[0].subids[index], "result": { "syncing": syncing } };
                if (index > -1) {
                    client.send(JSON.stringify(payload));
                }
            });
        });
        setTimeout(sync, 10000, pgClient, exspress, res.rows[0].maxID);
    });
}