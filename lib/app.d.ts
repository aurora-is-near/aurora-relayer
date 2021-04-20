import { Engine } from '@aurora-is-near/engine';
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
export declare function createApp(options: any, engine: any, provider: NearProvider): Promise<import("express-serve-static-core").Express>;
export declare function routeRPC(provider: NearProvider, engine: Engine, method: string, params: any[]): Promise<any>;
export {};
