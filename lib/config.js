/* This is free and unencumbered software released into the public domain. */
import { NETWORKS } from '@aurora-is-near/engine';
export function parseConfig(options, config) {
    const networkID = options.network || config.network;
    const network = NETWORKS.get(networkID); // TODO: error handling
    const debug = options.debug || config.debug;
    return [network, {
            debug: debug,
            verbose: debug || options.verbose || config.verbose,
            port: parseInt(options.port || config.port),
            network: networkID,
            endpoint: options.endpoint || config.endpoint || network.nearEndpoint,
            engine: options.engine || config.engine || network.contractID,
            signer: options.signer || config.signer,
            blacklist: config.blacklist || {},
        }];
}
