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
export declare function createApp(argv: any, provider: NearProvider): import("express-serve-static-core").Express;
export declare function routeRPC(provider: NearProvider, method: string, params: any[]): Promise<any>;
export {};
