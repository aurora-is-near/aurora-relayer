/* This is free and unencumbered software released into the public domain. */

import { Config } from './config.js';

import expressIpFilter from 'express-ipfilter';
const { IpDeniedError, IpFilter } = expressIpFilter;

import expressPinoLogger from 'express-pino-logger';

import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz', 16);

import { Logger } from 'pino';

export function setRequestID() {
  return (req: any, res: any, next: any): void => {
    const id =
      req.headers['x-request-id'] || req.headers['cf-request-id'] || nanoid();
    req['id'] = id;
    res.set('X-Request-ID', id);
    next();
  };
}

export function logger(logger: Logger): any {
  return expressPinoLogger({
    logger,
    genReqId: (req) => {
      return req.id;
    },
    reqCustomProps: (req, _res) => {
      const body = (req as any).body;
      if (!body || req?.method !== 'POST' || req?.url !== '/') return {};
      return {
        rpc: {
          method: body?.method,
          params: body?.params,
        },
      };
    },
  });
}

export function blacklistIPs(config: Config): any {
  const ips = (config?.blacklist?.ipv4 || []).concat(
    config?.blacklist?.ipv6 || []
  );
  return IpFilter(ips, {
    mode: 'deny',
    log: false,
    trustProxy: true,
  });
}

export function handleErrors() {
  return (err: any, req: any, res: any, next: any): void => {
    if (err instanceof IpDeniedError) {
      // TODO: req.log.info(...);
      res.status(403).end();
    } else {
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
