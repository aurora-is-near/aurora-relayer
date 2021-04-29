/* This is free and unencumbered software released into the public domain. */

export interface NearProvider {
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
