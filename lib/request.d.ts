/** Encapsulates the Express.js `Request` object. */
export declare class Request {
    readonly req: any;
    constructor(req: any);
    hasAuthorization(): boolean;
    token(): string;
    ip(): string;
    country(): string;
    websocketKey(): string;
}
