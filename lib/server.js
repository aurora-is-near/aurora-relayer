/* This is free and unencumbered software released into the public domain. */
import { SkeletonServer } from './servers/skeleton.js';
import { DatabaseServer } from './servers/database.js';
import { Method } from './method.js';
import jayson from 'jayson';
export function createServer(config, logger, engine) {
    const server = new DatabaseServer(config, logger, engine);
    const methodList = Object.getOwnPropertyNames(SkeletonServer.prototype)
        .filter((id) => id !== 'constructor' && id[0] != '_')
        .map((id) => [id, server[id]]);
    const methodMap = Object.fromEntries(methodList);
    const jaysonServer = new jayson.Server(methodMap, {
        methodConstructor: Method,
        useContext: server,
    });
    return jaysonServer;
}
