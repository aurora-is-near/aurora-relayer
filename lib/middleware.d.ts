import { Config } from './config.js';
import { Logger } from 'pino';
export declare function setRequestID(): (req: any, res: any, next: any) => void;
export declare function logger(logger: Logger): any;
export declare function blacklistIPs(config: Config): any;
export declare function rateLimitPerSec(_config: Config): any;
export declare function rateLimitPerMin(_config: Config): any;
export declare function rateLimitPerHour(_config: Config): any;
export declare function handleErrors(): (err: any, req: any, res: any, next: any) => void;
declare const _default: {
    setRequestID: typeof setRequestID;
    logger: typeof logger;
    blacklistIPs: typeof blacklistIPs;
    rateLimitPerSec: typeof rateLimitPerSec;
    rateLimitPerMin: typeof rateLimitPerMin;
    rateLimitPerHour: typeof rateLimitPerHour;
    handleErrors: typeof handleErrors;
};
export default _default;
