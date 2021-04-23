/* This is free and unencumbered software released into the public domain. */

import { Config } from './config.js';

import expressIpFilter from 'express-ipfilter';
const { IpDeniedError, IpFilter } = expressIpFilter;

import expressPinoLogger from 'express-pino-logger';
import expressRateLimit from 'express-rate-limit';

import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz', 16);

import { Logger } from 'pino';

export function setRequestID() {
    return (req: any, res: any, next: any): void => {
        const id = req.headers['x-request-id'] || nanoid();
        req['id'] = id;
        res.set('X-Request-ID', id);
        next();
    };
}

export function logger(logger: Logger): any {
    return expressPinoLogger({ logger });
}

export function blacklistIPs(config: Config): any {
    const ipv4 = config?.blacklist?.ipv4 || [];
    return IpFilter(ipv4, {
        mode: 'deny',
        log: false,
    });
}

export function rateLimit(_config: Config): any {
    return expressRateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 60,
        headers: false,
        draft_polli_ratelimit_headers: true,
        handler: (req, res) => {
            // TODO: req.log.info(...);
            res.status(429)
                .set('Content-Type', 'text/plain')
                .send("Too many requests, please try again later.");
        },
    });
}

export function handleErrors() {
    return (err: any, req: any, res: any, next: any): void => {
        if (err instanceof IpDeniedError) {
            // TODO: req.log.info(...);
            res.status(403).end();
        }
        else {
            next();
        }
    };
}

export default {
    setRequestID,
    logger,
    blacklistIPs,
    rateLimit,
    handleErrors,
};
