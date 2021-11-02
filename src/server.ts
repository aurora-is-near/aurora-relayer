/* This is free and unencumbered software released into the public domain. */

import { Config } from './config.js';
import { SkeletonServer } from './servers/skeleton.js';
import { DatabaseServer } from './servers/database.js';
import { Method } from './method.js';

import { Engine } from '@aurora-is-near/engine';
import jayson from 'jayson';
import { Logger } from 'pino';

interface MethodMap {
  [methodName: string]: jayson.MethodLike;
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
