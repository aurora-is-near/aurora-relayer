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
  const ipv4 = config?.blacklist?.ipv4 || [];
  return IpFilter(ipv4, {
    mode: 'deny',
    log: false,
  });
}

export function rateLimitPerSec(_config: Config): any {
  return expressRateLimit({
    windowMs: 1000, // 1 second
    max: 2,
    headers: false,
    draft_polli_ratelimit_headers: true,
    handler: (req, res) => {
      res
        .status(429)
        .set('Content-Type', 'text/plain')
        .send('Too many requests, please try again later.');
    },
  });
}

export function rateLimitPerMin(_config: Config): any {
  return expressRateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    headers: false,
    draft_polli_ratelimit_headers: true,
    handler: (req, res) => {
      res
        .status(429)
        .set('Content-Type', 'text/plain')
        .send('Too many requests, please try again later.');
    },
  });
}

export function rateLimitPerHour(_config: Config): any {
  return expressRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 360,
    headers: false,
    draft_polli_ratelimit_headers: true,
    handler: (req, res) => {
      res
        .status(429)
        .set('Content-Type', 'text/plain')
        .send('Too many requests, please try again later.');
    },
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
  rateLimitPerSec,
  rateLimitPerMin,
  rateLimitPerHour,
  handleErrors,
};
