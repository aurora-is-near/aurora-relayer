/* This is free and unencumbered software released into the public domain. */
import { WebSocketServer } from 'ws';
import { createServer } from './server.js';
export async function createApp(config, logger, engine) {
    const jaysonWsServer = createServer(config, logger, engine);
    const webSocketServer = new WebSocketServer({ port: config.wsPort });
    webSocketServer.on('connection', ws => {
        ws.on('message', function (msg) {
            try {
                const parsedObject = JSON.parse(msg);
                jaysonWsServer.call(parsedObject, {}, function (error, success) {
                    // webSocketServer.clients.forEach(client => client.send(body));
                    ws.send(JSON.stringify(error || success));
                });
            }
            catch (e) {
                // webSocketServer.clients.forEach(client => client.send('Syntax Error'));
                ws.send('Invalid request');
            }
        });
        ws.on("error", e => ws.send(e));
        ws.send('Connection established');
    });
}
