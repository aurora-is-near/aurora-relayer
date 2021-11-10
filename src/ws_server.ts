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
  const jaysonWsServer = createServer(config, logger, engine);
  const expressWsApp = expressWs(app);
  expressWsApp.app.ws('/', function (ws: any, req) {
    ws.id = req.headers['sec-websocket-key'];
    ws.on('message', function (msg: string) {
      try {
        const parsedObject = JSON.parse(msg);
        jaysonWsServer.call(
          parsedObject,
          {
            secWebsocketKey: req.headers['sec-websocket-key'],
            ip: req.socket.remoteAddress,
          },
          function (error: any, success: any) {
            ws.send(JSON.stringify(error || success));
          }
        );
      } catch (e) {
        ws.send('Invalid request');
      }
    });
    ws.on('close', function close() {
      pgClient.query('DELETE FROM subscription WHERE sec_websocket_key = $1', [
        ws.id,
      ]);
    });
    ws.on('error', (e: any) => ws.send(e));
    ws.send('Connection established');
  });

  // Listen to new block notifications:
  pgClient.on('notification', (message: pg.Notification) => {
    if (!message.payload) return;
    if (message.channel === 'block') {
      const blockID = parseInt(message.payload);
      if (isNaN(blockID)) return; // ignore UFOs
      pgClient
        .query('SELECT * FROM eth_getBlockByNumber($1) LIMIT 1', [blockID])
        .then(function (res: any) {
          pgClient
            .query(
              "SELECT COALESCE(array_agg(sec_websocket_key), '{}') AS wskeys FROM subscription WHERE type = 'newHeads'"
            )
            .then(function (sec_websocket_keys: any) {
              expressWsApp.getWss().clients.forEach(function (client: any) {
                if (sec_websocket_keys.rows[0].wskeys.indexOf(client.id) > -1) {
                  client.send(JSON.stringify(exportJSON(res.rows[0])));
                }
              });
            });
        });
    }
    if (message.channel === 'transaction') {
      const parsedObject = JSON.parse(message.payload);
      pgClient
        .query(
          'SELECT * FROM eth_getTransactionByBlockNumberAndIndex($1, $2) LIMIT 1',
          [parsedObject.blockId, parsedObject.index]
        )
        .then(function (res: any) {
          pgClient
            .query(
              "SELECT COALESCE(array_agg(sec_websocket_key), '{}') AS wskeys FROM subscription WHERE type = 'newPendingTransactions'"
            )
            .then(function (sec_websocket_keys: any) {
              expressWsApp.getWss().clients.forEach(function (client: any) {
                if (sec_websocket_keys.rows[0].wskeys.indexOf(client.id) > -1) {
                  client.send(JSON.stringify(exportJSON(res.rows[0])));
                }
              });
            });
        });
    }
  });
  pgClient.query('LISTEN block');
  pgClient.query('LISTEN transaction');
  return true;
}
