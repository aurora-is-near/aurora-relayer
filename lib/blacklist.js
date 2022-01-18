/* This is free and unencumbered software released into the public domain. */
import yaml from 'js-yaml';
import fs from 'fs';
export function blacklist(method) {
    const globalAny = global;
    if (globalAny.blacklistConfig === undefined || globalAny.blacklistConfig === null) {
        try {
            const blacklistConfig = yaml.load(fs.readFileSync('config/blacklist.yaml', 'utf8'));
            globalAny.blacklistConfig = {
                IPs: new Set(blacklistConfig.IPs || []),
                EOAs: new Set(blacklistConfig.EOAs || []),
                CAs: new Set(blacklistConfig.CAs || []),
            };
        }
        catch (e) {
            console.error(`Blacklist configuration file can not be loaded (${e}).`);
            return [];
        }
    }
    return globalAny.blacklistConfig[method];
}
