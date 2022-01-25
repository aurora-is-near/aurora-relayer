/* This is free and unencumbered software released into the public domain. */

import { Config } from './config.js';
import middleware from './middleware.js';
import { createServer } from './server.js';
import { createWsServer } from './ws_server.js';

import { Engine, TransactionErrorDetails } from '@aurora-is-near/engine';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import jayson from 'jayson';
//import { exit } from 'process';
import { Logger } from 'pino';

//import { assert } from 'node:console';

interface Headers {
  'Content-Length': number;
  'Content-Type': string;
  'X-Aurora-Error-Code'?: string;
  'X-NEAR-Gas-Burned'?: string;
  'X-Aurora-Result'?: string;
  'X-NEAR-Transaction-ID'?: string;
}

export async function createApp(
  config: Config,
  logger: Logger,
  engine: Engine
): Promise<any> {
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

function rpcMiddleware(server: jayson.Server): any {
  return function (req: any, res: any): any {
    const options: any = server.options;

    if (req.headers['sec-websocket-key']) {
      res.next();
    }

    if ((req.method || '') != 'POST') {
      return error(405, { Allow: 'POST' });
    }

    if (
      !RegExp('application/json', 'i').test(
        (req || { headers: {} }).headers['content-type'] || ''
      )
    ) {
      return error(415);
    }

    //assert(req.body && typeof req.body === 'object');
    server.call(req.body, req, function (error: any, success: any) {
      const response = error || success;
      let body = JSON.stringify(response);
      if (!body) {
        res.writeHead(204);
      } else {
        const headers: Headers = {
          'Content-Length': Buffer.byteLength(body, options.encoding),
          'Content-Type': 'application/json; charset=utf-8',
        };

        if (req?.body?.method == 'eth_sendRawTransaction') {
          if (typeof response?.error?.message === 'string') {
            const message = error.error.message;
            let code = message;
            const sepIndex = code.lastIndexOf('|');
            if (sepIndex > -1) {
              code = message.substring(0, sepIndex);
              const details = parseErrorDetails(
                message.substring(sepIndex + 1)
              );
              if (details.gasBurned) {
                headers['X-NEAR-Gas-Burned'] = details.gasBurned;
              }
              if (details.tx) {
                headers['X-NEAR-Transaction-ID'] = details.tx;
              }
            }
            headers['X-Aurora-Error-Code'] = code.replace(
              /[^a-zA-Z0-9!#$%&'*+\-.^_`|~ ]/g,
              ''
            );
            response.error.message = code;
            body = JSON.stringify(response);
            headers['Content-Length'] = Buffer.byteLength(
              body,
              options.encoding
            );
          } else if (response?.result) {
            headers['X-Aurora-Result'] = response.result;
          }
        }
        res.writeHead(200, headers);
        res.write(body);
      }
      res.end();
    });

    function error(code: any, headers?: any) {
      res.writeHead(code, headers || {});
      res.end();
    }

    function parseErrorDetails(details: string): TransactionErrorDetails {
      try {
        return JSON.parse(details);
      } catch (e) {
        return {};
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
