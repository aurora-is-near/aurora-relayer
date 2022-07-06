/* This is free and unencumbered software released into the public domain. */

import { Config } from './config.js';
import { SkeletonServer } from './servers/skeleton.js';
import { DatabaseServer } from './servers/database.js';
import { Request } from './request.js';
import { ExpectedError } from './errors.js';

import { bytesToHex } from '@aurora-is-near/engine';
import { Engine } from '@aurora-is-near/engine';
import jayson from 'jayson';
import { Logger } from 'pino';

interface MethodMap {
  [methodName: string]: jayson.MethodLike;
}

export class Method extends jayson.Method {
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
    request: any, // context
    callback: jayson.JSONRPCCallbackType
  ): any {
    const args = (requestParams || []) as any[];
    const result: Promise<any> = (this.handler as any).call(
      this.server,
      new Request(request),
      ...args
    );
    result
      .then((value: any) => (callback as any)(undefined, value))
      .catch((error: Error) => {
        const metadata = {
          host: request?.headers?.host || undefined,
          'cf-ray': request?.headers?.['cf-ray'] || undefined,
          'cf-request-id': request?.headers?.['cf-request-id'] || undefined,
        };
        if (error instanceof ExpectedError) {
          return (callback as any)(
            server.error(
              error.code,
              error.message,
              error.data
                ? ((bytesToHex(error.data) as unknown) as undefined)
                : {
                    ...metadata,
                    ...{ request_body: request.body },
                  }
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
            `Internal Error - ${error.message}. Please report a bug at <https://github.com/aurora-is-near/aurora-relayer/issues>`,
            {
              ...metadata,
              ...{ request_body: request.body },
            }
          )
        );
      });
    return null;
  }
}

export function createServer(
  config: Config,
  logger: Logger,
  engine: Engine
): jayson.Server {
  const server = new DatabaseServer(config, logger, engine);
  const methodList = Object.getOwnPropertyNames(SkeletonServer.prototype)
    .filter((id: string) => id !== 'constructor' && id[0] != '_')
    .map((id: string) => [id, (server as any)[id]]);
  const methodMap: MethodMap = Object.fromEntries(methodList);
  const jaysonServer = new jayson.Server(methodMap, {
    methodConstructor: Method,
    useContext: server as any,
  });
  return jaysonServer;
}
