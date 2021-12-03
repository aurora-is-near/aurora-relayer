/* This is free and unencumbered software released into the public domain. */

import { Contract } from './types';
import { Config } from '../../lib/config';

export const contracts: Record<string, Partial<Contract>> = {
  sum: {
    abi:
      '[{"inputs":[{"internalType":"uint256","name":"x","type":"uint256"},{"internalType":"uint256","name":"y","type":"uint256"}],"name":"add","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"}]',
    bytecode:
      '608060405234801561001057600080fd5b5060db8061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063771602f714602d575b600080fd5b603c6038366004605f565b604e565b60405190815260200160405180910390f35b6000605882846080565b9392505050565b60008060408385031215607157600080fd5b50508035926020909101359150565b6000821982111560a057634e487b7160e01b600052601160045260246000fd5b50019056fea2646970667358221220dcd27c2a84c85b19711ab9711564c2dad030e11cb79e980943f82bbd372b7e4564736f6c63430008070033',
    data:
      '0x771602f700000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002',
    output:
      '0x0000000000000000000000000000000000000000000000000000000000000003',
  },
  storage: {
    abi: '',
    bytecode: '',
    data: '',
  },
};

export const gasPrice = '0x0';
export const gas = '0x0';
export const rpcProviderUrl = 'http://localhost:8545';
export const privateKeyHex =
  'fa5411587e855bb1e8273bc728f4fc1a092e2dd61ddf788a31b98d78cca95028';
export const publicKey = '0x702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d6';

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
