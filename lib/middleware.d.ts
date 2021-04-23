/// <reference types="pino-http" />
/// <reference types="qs" />
/// <reference types="express" />
import expressPinoLogger from 'express-pino-logger';
import expressRateLimit from 'express-rate-limit';
export declare function setRequestID(): (req: any, res: any, next: any) => void;
export declare function logger(): expressPinoLogger.HttpLogger;
export declare function blacklistIPs(ipAddresses: string[]): import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare function rateLimit(): expressRateLimit.RateLimit;
export declare function handleErrors(): (err: any, req: any, res: any, next: any) => void;
declare const _default: {
    setRequestID: typeof setRequestID;
    logger: typeof logger;
    blacklistIPs: typeof blacklistIPs;
    rateLimit: typeof rateLimit;
    handleErrors: typeof handleErrors;
};
export default _default;
