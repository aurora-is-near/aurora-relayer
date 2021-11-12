/* This is free and unencumbered software released into the public domain. */

import { Config } from './config.js';
import { createServer } from './server.js';
import pg from 'pg';
import expressWs from 'express-ws';
import { Engine, exportJSON } from '@aurora-is-near/engine';
import { Logger } from 'pino';

export function createWsServer(
  config: Config,
  logger: Logger,
  engine: Engine,
  app: any
): Boolean {
  const pgClient = new pg.Client(config.database);
  pgClient.connect();
  const jaysonWsServer = createServer(config, logger, engine)
  const expressWsApp = expressWs(app);
  expressWsApp.app.ws("/", function(ws: any, req) {
    ws.id = req.headers['sec-websocket-key'];
    ws.on('message', function(msg: string) {
      try {
        const parsedObject = JSON.parse(msg);
        jaysonWsServer.call(parsedObject, { secWebsocketKey: req.headers['sec-websocket-key'], ip: req.socket.remoteAddress }, function (error: any, success: any) {
          ws.send(JSON.stringify(error || success));
        });
      } catch(e) {
        ws.send('Invalid request');
      }
    });
    ws.on('close', function close() {
      pgClient.query("DELETE FROM subscription WHERE sec_websocket_key = $1", [ws.id])
    });
    ws.on("error", (e: any) => ws.send(e));
    ws.send('Connection established');
  });

  // Listen to new block notifications:
  pgClient.on('notification', (message: pg.Notification) => {
    if (!message.payload) return;
    if (message.channel === 'block') {
      const blockID = parseInt(message.payload);
      if (isNaN(blockID)) return; // ignore UFOs
      const body = {"jsonrpc": "2.0", "id": 1, "method": "eth_getBlockByNumber", "params": [blockID, true] }
      jaysonWsServer.call(body, {}, function (error: any, success: any) {
        forSubscriptions(pgClient, 'newHeads', function (row: any){
          sendPayload(expressWsApp, row.ws_key, row.sub_id, error || success)
        })
      })
    }

    if (message.channel === 'log') {
      const parsedObject = JSON.parse(message.payload)
      const params = { "fromBlock": parsedObject.blockId, "toBlock": parsedObject.blockId, "index": parsedObject.index }
      const body = {"jsonrpc": "2.0", "id": 1, "method": "eth_getLogs", "params": [params] }
      jaysonWsServer.call(body, {}, function (error: any, success: any) {
        forSubscriptions(pgClient, 'logs', function (row: any){
          const address = (row.filter && row.filter.address && row.filter.address.id.toLowerCase()) || null
          const topics = (row.filter && row.filter.topics) || null
          if(address && address != success.result[0].address) {
            // Skip delivery
          } else if(topics && topics.filter(function(x: any) { return success.result[0].topics.includes(x) } ).length == 0) {
            // Skip delivery
          } else {
            sendPayload(expressWsApp, row.ws_key, row.sub_id, error || success)
          }
        })
      })
    }

    // How to determine if transaction is pending? is it by status column
    if (message.channel === 'transaction') {
      const parsedObject = JSON.parse(message.payload)
      const body = {"jsonrpc": "2.0", "id": 1, "method": "eth_getTransactionByBlockNumberAndIndex", "params": [parsedObject.blockId, parsedObject.index] }
      jaysonWsServer.call(body, {}, function (error: any, success: any) {
        forSubscriptions(pgClient, 'newPendingTransactions', function (row: any){
          sendPayload(expressWsApp, row.ws_key, row.sub_id, error || success)
        })
      })
    }
  });
  pgClient.query('LISTEN block');
  pgClient.query('LISTEN transaction');
  pgClient.query('LISTEN log');
  setTimeout(sync, 1000, pgClient, expressWsApp);
  return true;
}

function sync(pgClient: any, expressWsApp: any, blockNumber: any) {
  pgClient.query('SELECT MAX(id)::int AS max_id FROM block').then(function (max_idResult: any) {
    let max_id = max_idResult.rows[0].max_id || 0
    forSubscriptions(pgClient, 'sync', function (row: any){
      let payload = { "jsonrpc":"2.0", "subscription": row.sub_id, "result": { "syncing": max_id > blockNumber } }
      sendPayload(expressWsApp, row.ws_key, row.sub_id, JSON.stringify(payload))
    })
    setTimeout(sync, 10000, pgClient, expressWsApp, max_id);
  })
}

function sendPayload(express: any, ws_key: any, subId: any, payload: any) {
  express.getWss().clients.forEach( function (client: any) {
    if (ws_key == client.id) {
      typeof payload === 'string' ? client.send(payload) : client.send(wsResponse(payload, subId))
    }
  })
}

function wsResponse(rpcResponse: any, clientId: any) {
  const response = {
    "jsonrpc": "2.0",
    "method": "eth_subscription",
    "params": {
      "result": rpcResponse.result,
      "subscription": clientId
    }
  }
  return JSON.stringify(exportJSON(response))
}

function forSubscriptions(pgClient: any, subscriptionType: string, callback: any) {
  pgClient.query(`SELECT sec_websocket_key AS ws_key, id AS sub_id, filter FROM subscription WHERE type = '${subscriptionType}'`)
    .then(function (pgResult: any) {
      pgResult.rows.forEach( function (row: any) {
        callback(row)
      })
    })
}
