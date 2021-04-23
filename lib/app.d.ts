import { Config } from './config.js';
import { Engine } from '@aurora-is-near/engine';
import { Logger } from 'pino';
interface NearProvider {
    networkId: string;
    evm_contract: string;
    isReadOnly: boolean;
    url: string;
    version: string;
    nearProvider: any;
    keyStore: any;
    signer: any;
    connection: any;
    accountId: string;
    account: any;
    accountEvmAddress: string;
    accounts: Map<string, any>;
    walletUrl: string;
    explorerUrl: string;
}
export declare function createApp(config: Config, logger: Logger, engine: Engine, provider: NearProvider): Promise<any>;
export {};
