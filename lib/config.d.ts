import { ConnectEnv, NetworkConfig } from '@aurora-is-near/engine';
export interface Config {
    debug: boolean;
    verbose: boolean;
    force: boolean;
    database?: string;
    broker?: string;
    port: number | string;
    network: string;
    endpoint?: string;
    engine: string;
    signer: string;
    signerKey?: string;
    signerKeys?: string[];
    block?: number | string;
    batchSize?: number | string;
    writable?: boolean;
    errorLog?: string;
}
export declare const localConfig: Config;
export declare function parseConfig(options: Config, config: Config, env: ConnectEnv): [NetworkConfig, Config];
