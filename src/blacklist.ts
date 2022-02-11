/* This is free and unencumbered software released into the public domain. */

import yaml from 'js-yaml';
import fs from 'fs';

export interface BlacklistConfig {
  IPs: Set<string>;
  EOAs: Set<string>;
  CAs: Set<string>;
}

export function blacklist(method: string) {
  const globalAny = global as any;
  if (
    globalAny.blacklistConfig === undefined ||
    globalAny.blacklistConfig === null
  ) {
    try {
      const blacklistConfig = yaml.load(
        fs.readFileSync('config/blacklist.yaml', 'utf8')
      ) as BlacklistConfig;
      globalAny.blacklistConfig = {
        IPs: new Set(blacklistConfig.IPs || []),
        EOAs: new Set(blacklistConfig.EOAs || []),
        CAs: new Set(blacklistConfig.CAs || []),
      };
    } catch (e) {
      console.error(`Blacklist configuration file can not be loaded (${e}).`);
      globalAny.blacklistConfig = {
        IPs: new Set([]),
        EOAs: new Set([]),
        CAs: new Set([]),
      };
    }
  }
  return globalAny.blacklistConfig[method];
}
