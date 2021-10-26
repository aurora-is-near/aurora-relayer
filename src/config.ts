/* This is free and unencumbered software released into the public domain. */

import { ConnectEnv, NetworkConfig, NETWORKS } from '@aurora-is-near/engine';

export interface Config {
  debug: boolean;
  verbose: boolean;
  force: boolean;
  database?: string;
  port: number | string;
  network: string;
  endpoint?: string;
  engine: string;
  signer: string;
  signerKey?: string;
  signerKeys?: string[];
  blacklist: { ipv4?: string[]; ipv6?: string[] };
  block?: number | string;
  batchSize?: number | string;
  writable?: boolean;
  errorLog?: string;
}

export const localConfig: Config = {
  debug: false,
  verbose: false,
  force: false,
  database: undefined,
  port: 8545,
  network: 'local',
  endpoint: 'http://127.0.0.1:3030',
  engine: 'aurora.test.near',
  signer: 'test.near',
  signerKey: undefined,
  signerKeys: [],
  blacklist: { ipv4: [], ipv6: [] },
  writable: true,
  errorLog: undefined,
};

export function parseConfig(
  options: Config,
  config: Config,
  env: ConnectEnv
): [NetworkConfig, Config] {
  const networkID = options.network || env.NEAR_ENV || config.network;
  if (!networkID) {
    throw new Error(`Missing network ID. Use: --network <network>`);
  }
  const network = NETWORKS.get(networkID);
  if (!network) {
    throw new Error(`Unknown network ID: '${networkID}'`);
  }
  const debug = options.debug || config.debug;
  return [
    network,
    {
      debug: debug,
      verbose: debug || options.verbose || config.verbose,
      force: options.force || config.force,
      database: options.database || config.database,
      port: parseInt((options.port as string) || (config.port as string)),
      network: networkID,
      endpoint:
        options.endpoint ||
        env.NEAR_URL ||
        config.endpoint ||
        network.nearEndpoint,
      engine:
        options.engine ||
        env.AURORA_ENGINE ||
        config.engine ||
        network.contractID,
      signer: options.signer || env.NEAR_MASTER_ACCOUNT || config.signer,
      signerKey: options.signerKey || config.signerKey,
      signerKeys: config.signerKeys || [],
      blacklist: config.blacklist || {},
      batchSize: parseInt(
        (options.batchSize as string) || (config.batchSize as string) || '1000'
      ),
      writable: config.writable !== undefined ? config.writable : true,
      errorLog: config.errorLog,
    },
  ];
}
