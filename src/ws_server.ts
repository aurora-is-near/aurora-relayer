/* This is free and unencumbered software released into the public domain. */

import { Config } from './config.js';
import { matchTopics } from './topics.js';
import { createServer } from './server.js';
import pg from 'pg';
import expressWs from 'express-ws';
import { Engine, exportJSON } from '@aurora-is-near/engine';
import { Logger } from 'pino';

const syncInterval = 3000;
const newHeadsInterval = 200;

export async function createWsServer(
  config: Config,
  logger: Logger,
  engine: Engine,
  app: any
): Promise<boolean> {
  // const pgPool = new pg.Pool({ "connectionString": config.database });
  const pgClient = new pg.Client(config.database);
  pgClient.connect();
  pgClient.query('DELETE FROM subscription');
  const jaysonWsServer = createServer(config, logger, engine);
  const expressWsApp = expressWs(app);
  expressWsApp.app.ws('/', function (ws: any, req) {
    ws.id = req.headers['sec-websocket-key'];
    ws.on('message', function (msg: string) {
      try {
        const parsedObject = JSON.parse(msg);
        jaysonWsServer.call(
          parsedObject,
          req,
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
    ws.on('error', () => {
      ws.send('Error connecting to WebSocket');
    });
  });

  setTimeout(sync, syncInterval, pgClient, expressWsApp);
  const blockHeight = ((await engine.getBlockHeight()).unwrap() as number) + 10;
  setTimeout(
    notifyNewHeads,
    newHeadsInterval,
    pgClient,
    expressWsApp,
    jaysonWsServer,
    blockHeight
  );
  return true;
}

async function sync(pgClient: any, expressWsApp: any, blockNumber: any) {
  const maxIdResult = await pgClient.query(
    'SELECT MAX(id)::int AS max_id FROM block'
  );
  const maxID = maxIdResult.rows[0].max_id || 0;
  forSubscriptions(pgClient, 'syncing', function (row: any) {
    const payload = {
      jsonrpc: '2.0',
      subscription: row.sub_id,
      result: { syncing: maxID > blockNumber },
    };
    sendPayload(expressWsApp, row.ws_key, row.sub_id, JSON.stringify(payload));
  });
  setTimeout(sync, syncInterval, pgClient, expressWsApp, maxID);
}

async function notifyNewHeads(
  pgClient: any,
  expressWsApp: any,
  jaysonWsServer: any,
  blockNumber: number
) {
  const result = await pgClient.query(
    'SELECT 1 FROM block WHERE id = $1 LIMIT 1',
    [blockNumber]
  );
  if (result.rows.length > 0) {
    const blockBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getBlockByNumber',
      params: [blockNumber, true],
    };
    jaysonWsServer.call(blockBody, {}, function (error: any, success: any) {
      forSubscriptions(pgClient, 'newHeads', function (row: any) {
        sendPayload(expressWsApp, row.ws_key, row.sub_id, error || success);
      });
    });

    const logsBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getLogs',
      params: [
        {
          fromBlock: blockNumber,
          toBlock: blockNumber,
        },
      ],
    };
    jaysonWsServer.call(logsBody, {}, function (error: any, success: any) {
      forSubscriptions(pgClient, 'logs', function (row: any) {
        const address = parseAddresses(row.filter?.address);
        const topics = row.filter?.topics || [];
        let result = success.result;
        if (address.length > 0) {
          result = result.filter((result: any) => {
            return address.includes(result.address);
          });
        }
        if (topics.length > 0) {
          result = result.filter((result: any) => {
            return matchTopics(topics, result.topics);
          });
        }
        result.forEach(function (res: any) {
          sendPayload(expressWsApp, row.ws_key, row.sub_id, {
            ...success,
            ...{ result: res },
          });
        });
      });
    });

    blockNumber = blockNumber + 1;
  }
  setTimeout(
    notifyNewHeads,
    newHeadsInterval,
    pgClient,
    expressWsApp,
    jaysonWsServer,
    blockNumber
  );
}

function sendPayload(express: any, ws_key: any, subId: any, payload: any) {
  express.getWss().clients.forEach(function (client: any) {
    if (ws_key == client.id) {
      typeof payload === 'string'
        ? client.send(payload)
        : client.send(wsResponse(payload, subId));
    }
  });
}

function wsResponse(rpcResponse: any, clientId: any) {
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

function forSubscriptions(
  pgClient: any,
  subscriptionType: string,
  callback: any
) {
  pgClient
    .query(
      `SELECT sec_websocket_key AS ws_key, id AS sub_id, filter FROM subscription WHERE type = $1`,
      [subscriptionType]
    )
    .then(function (pgResult: any) {
      pgResult.rows.forEach(callback);
    });
}
function parseAddresses(inputs: any): any[] {
  const addresses = (Array.isArray(inputs) ? inputs : [inputs]).map(
    (input: any) => {
      return input?.id?.toLowerCase() || null;
    }
  );
  return addresses.filter((x): x is any => x !== null);
}
