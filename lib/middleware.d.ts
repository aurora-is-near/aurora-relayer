import { Logger } from 'pino';
export declare function setRequestID(): (req: any, res: any, next: any) => void;
export declare function logger(logger: Logger): any;
export declare function blacklistIPs(): any;
export declare function handleErrors(): (err: any, req: any, res: any, next: any) => void;
declare const _default: {
    setRequestID: typeof setRequestID;
    logger: typeof logger;
    blacklistIPs: typeof blacklistIPs;
    handleErrors: typeof handleErrors;
};
export default _default;
