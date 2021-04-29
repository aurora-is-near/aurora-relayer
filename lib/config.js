/* This is free and unencumbered software released into the public domain. */
import { NETWORKS } from '@aurora-is-near/engine';
export function parseConfig(options, config, env) {
    const networkID = options.network || env.NEAR_ENV || config.network;
    const network = NETWORKS.get(networkID); // TODO: error handling
    const debug = options.debug || config.debug;
    return [
        network,
        {
            debug: debug,
            verbose: debug || options.verbose || config.verbose,
            database: options.database || config.database,
            port: parseInt(options.port || config.port),
            network: networkID,
            endpoint: options.endpoint ||
                env.NEAR_URL ||
                config.endpoint ||
                network.nearEndpoint,
            engine: options.engine ||
                env.AURORA_ENGINE ||
                config.engine ||
                network.contractID,
            signer: options.signer || env.NEAR_MASTER_ACCOUNT || config.signer,
            blacklist: config.blacklist || {},
        },
    ];
}
