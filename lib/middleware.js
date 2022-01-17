/* This is free and unencumbered software released into the public domain. */
import { blacklist } from './blacklist.js';
import expressIpFilter from 'express-ipfilter';
const { IpDeniedError, IpFilter } = expressIpFilter;
import expressPinoLogger from 'express-pino-logger';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz', 16);
export function setRequestID() {
    return (req, res, next) => {
        const id = req.headers['x-request-id'] || req.headers['cf-request-id'] || nanoid();
        req['id'] = id;
        res.set('X-Request-ID', id);
        next();
    };
}
export function logger(logger) {
    return expressPinoLogger({
        logger,
        genReqId: (req) => {
            return req.id;
        },
        reqCustomProps: (req, _res) => {
            const body = req.body;
            if (!body || req?.method !== 'POST' || req?.url !== '/')
                return {};
            return {
                rpc: {
                    method: body?.method,
                    params: body?.params,
                },
            };
        },
    });
}
export function blacklistIPs() {
    const ipLookup = () => {
        return [...(blacklist('IPs') || [])];
    };
    return IpFilter(ipLookup, {
        mode: 'deny',
        log: false,
        trustProxy: true,
    });
}
export function handleErrors() {
    return (err, req, res, next) => {
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
    handleErrors,
};
