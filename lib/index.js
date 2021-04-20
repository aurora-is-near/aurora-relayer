#!/usr/bin/env node
/* This is free and unencumbered software released into the public domain. */
import { createApp } from './app.js';
import { NETWORKS } from '@aurora-is-near/engine';
import { program } from 'commander';
import nearProvider from 'near-web3-provider';
main(process.argv, process.env);
async function main(argv, env) {
    program
        .option('-d, --debug', 'enable debug output')
        .option('-v, --verbose', 'enable verbose output')
        .option("--port <port>", "specify port to listen to", '8545')
        .option("--network <network>", "specify NEAR network ID", env.NEAR_ENV || 'local')
        .option("--endpoint <url>", "specify NEAR RPC endpoint URL", env.NEAR_URL)
        .option("--engine <account>", "specify Aurora Engine account ID", env.AURORA_ENGINE || 'aurora.test.near')
        .option("--signer <account>", "specify signer account ID", env.NEAR_MASTER_ACCOUNT || 'test.near')
        .parse(argv);
    const options = program.opts();
    if (options.debug)
        console.log(options);
    const network = NETWORKS.get(options.network);
    const provider = new nearProvider.NearProvider({
        nodeUrl: options.endpoint || network.nearEndpoint,
        networkId: network.id,
        evmAccountId: options.engine || network.contractID,
        masterAccountId: options.signer || 'test.near',
        keyPath: (network.id == 'local') && '~/.near/validator_key.json',
    });
    const port = parseInt(options.port);
    createApp(options, provider).listen(port, () => {
        console.log(`Web3 JSON-RPC proxy for the NEAR ${network.label} listening at http://localhost:${port}...`);
    });
}
