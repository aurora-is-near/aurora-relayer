/* This is free and unencumbered software released into the public domain. */

/** Encapsulates the Express.js `Request` object. */
export class Request {
  constructor(public readonly req: any) {}

  hasAuthorization(): boolean {
    return 'authorization' in this.req.headers;
  }

  token(): string {
    return this.req.url.length >= 2 ? this.req.url.substring(1) : '';
  }

  ip(): string {
    return this.req.headers['cf-connecting-ip'];
  }

  country(): string {
    return this.req.headers['cf-ipcountry'];
  }

  websocketKey(): string {
    return this.req.headers['sec-websocket-key'];
  }
}
