import { ConnectEnv, NetworkConfig } from '@aurora-is-near/engine';
export interface Config {
    debug: boolean;
    verbose: boolean;
    database?: string;
    port: number | string;
    network: string;
    endpoint?: string;
    engine: string;
    signer: string;
    blacklist: {
        ipv4?: string[];
        ipv6?: string[];
    };
    block?: number | string;
}
export declare const localConfig: Config;
export declare function parseConfig(options: Config, config: Config, env: ConnectEnv): [NetworkConfig, Config];
