/* This is free and unencumbered software released into the public domain. */

import { NetworkConfig, NETWORKS } from '@aurora-is-near/engine';

export interface Config {
    debug: boolean;
    verbose: boolean;
    port: number | string;
    network: string;
    endpoint?: string;
    engine: string;
    signer: string;
    blacklist: {ipv4?: string[], ipv6?: string[]};
}

export function parseConfig(options: Config, config: Config): [NetworkConfig, Config] {
    const networkID = options.network || config.network;
    const network = NETWORKS.get(networkID)!; // TODO: error handling
    const debug = options.debug || config.debug;
    return [network, {
        debug: debug,
        verbose: debug || options.verbose || config.verbose,
        port: parseInt(options.port as string || config.port as string),
        network: networkID,
        endpoint: options.endpoint || config.endpoint || network.nearEndpoint,
        engine: options.engine || config.engine || network.contractID,
        signer: options.signer || config.signer,
        blacklist: config.blacklist || {},
    }];
}
