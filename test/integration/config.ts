/* This is free and unencumbered software released into the public domain. */
import { Config } from '../../lib/config';

export const config: Config = {
  debug: false,
  verbose: false,
  force: false,
  database: 'postgres://aurora:aurora@localhost:5432/aurora',
  broker: undefined,
  port: 8545,
  network: 'testnet',
  endpoint: 'https://rpc.testnet.near.org', // TODO: change to local NEAR RPC
  engine: 'aurora',
  signer: '', // TODO: singer handle here
  signerKey: '', // TODO: singer key here
  signerKeys: [],
  blacklistIPs: new Set(),
  blacklistEOAs: new Set(),
  blacklistCAs: new Set(),
  writable: true,
  errorLog: undefined,
};
