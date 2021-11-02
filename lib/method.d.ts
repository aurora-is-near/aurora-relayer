import jayson from 'jayson';
export declare class Method extends jayson.Method {
    handler?: jayson.MethodHandlerType | undefined;
    readonly server: any;
    constructor(handler?: jayson.MethodHandlerType | undefined, options?: jayson.MethodOptions);
    getHandler(): jayson.MethodHandlerType;
    setHandler(handler: jayson.MethodHandlerType): void;
    execute(server: jayson.Server, requestParams: jayson.RequestParamsLike, request: any, // context
    callback: jayson.JSONRPCCallbackType): any;
}
