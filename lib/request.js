/* This is free and unencumbered software released into the public domain. */
/** Encapsulates the Express.js `Request` object. */
export class Request {
    constructor(req) {
        this.req = req;
    }
    hasAuthorization() {
        return 'authorization' in this.req.headers;
    }
    ip() {
        return this.req.headers['cf-connecting-ip'];
    }
    country() {
        return this.req.headers['cf-ipcountry'];
    }
    websocketKey() {
        return this.req.headers['sec-websocket-key'];
    }
}
