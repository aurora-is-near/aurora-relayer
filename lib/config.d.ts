import { NetworkConfig } from '@aurora-is-near/engine';
export interface Config {
    debug: boolean;
    verbose: boolean;
    port: number | string;
    network: string;
    endpoint?: string;
    engine: string;
    signer: string;
    blacklist: {
        ipv4?: string[];
        ipv6?: string[];
    };
}
export declare function parseConfig(options: Config, config: Config): [NetworkConfig, Config];
