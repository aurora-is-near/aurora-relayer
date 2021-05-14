/* This is free and unencumbered software released into the public domain. */

import { Config } from './config.js';
import { ExpectedError } from './errors.js';
import middleware from './middleware.js';
import { NearProvider } from './provider.js';
import { DatabaseServer } from './servers/database.js';
import { EphemeralServer } from './servers/ephemeral.js';
import { SkeletonServer } from './servers/skeleton.js';

import { bytesToHex, Engine } from '@aurora-is-near/engine';
import bodyParser from 'body-parser';
import connect from 'connect';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import jayson from 'jayson';
//import nearProvider from 'near-web3-provider';
//import { exit } from 'process';
import { Logger } from 'pino';

export { Engine } from '@aurora-is-near/engine';

import { assert } from 'node:console';

export async function createApp(
  config: Config,
  logger: Logger,
  engine: Engine,
  provider: NearProvider
): Promise<any> {
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

  return app;
}

class Method extends jayson.Method {
  public readonly server;

  constructor(
    public handler?: jayson.MethodHandlerType,
    options?: jayson.MethodOptions
  ) {
    super(handler, {});
    this.server = options?.useContext as any; // HACK
  }

  getHandler(): jayson.MethodHandlerType {
    return this.handler!;
  }

  setHandler(handler: jayson.MethodHandlerType) {
    this.handler = handler;
  }

  execute(
    server: jayson.Server,
    requestParams: jayson.RequestParamsLike,
    _request: any, // context
    callback: jayson.JSONRPCCallbackType
  ): any {
    const args = (requestParams || []) as any[];
    const result: Promise<any> = (this.handler as any).call(
      this.server,
      ...args
    );
    result
      .then((value: any) => (callback as any)(undefined, value))
      .catch((error: any) => {
        const timestamp = Math.floor(Date.now() / 1_000);
        if (error instanceof ExpectedError) {
          return (callback as any)(
            server.error(
              error.code,
              error.message,
              error.data
                ? ((bytesToHex(error.data) as unknown) as undefined)
                : { timestamp }
            )
          );
        }
        if (this.server?.config?.debug) {
          console.error(error);
        }
        if (this.server?.logger) {
          this.server.logger.error(error);
        }
        return (callback as any)(
          server.error(
            -32603,
            'Internal error, please report a bug at <https://github.com/aurora-is-near/aurora-relayer/issues>',
            { timestamp } // TODO: req.id
          )
        );
      });
    return null;
  }
}

interface MethodMap {
  [methodName: string]: jayson.MethodLike;
}

function createServer(
  config: Config,
  logger: Logger,
  engine: Engine,
  provider: NearProvider
): connect.HandleFunction {
  const serverClass = config.database ? DatabaseServer : EphemeralServer;
  const server = new serverClass(config, logger, engine, provider);
  const methodList = Object.getOwnPropertyNames(SkeletonServer.prototype)
    .filter((id: string) => id !== 'constructor' && id[0] != '_')
    .map((id: string) => [id, (server as any)[id]]);
  const methodMap: MethodMap = Object.fromEntries(methodList);
  const jaysonServer = new jayson.Server(methodMap, {
    methodConstructor: Method,
    useContext: server as any,
  });
  return rpcMiddleware(jaysonServer);
}

function rpcMiddleware(server: jayson.Server): any {
  return function (req: any, res: any): any {
    const options: any = server.options;

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

    assert(req.body && typeof req.body === 'object');
    server.call(req.body, req, function (error: any, success: any) {
      const response = error || success;
      const body = JSON.stringify(response);
      if (!body) {
        res.writeHead(204);
      } else {
        const headers = {
          'Content-Length': Buffer.byteLength(body, options.encoding),
          'Content-Type': 'application/json; charset=utf-8',
        };
        res.writeHead(200, headers);
        res.write(body);
      }
      res.end();
    });

    function error(code: any, headers?: any) {
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
