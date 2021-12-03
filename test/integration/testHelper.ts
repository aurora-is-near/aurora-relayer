/* This is free and unencumbered software released into the public domain. */
import pino from 'pino';
import { DeploymentResult } from './types';
import {
  config,
  contracts,
  gas,
  gasPrice,
  rpcProviderUrl,
  privateKeyHex,
} from './constants';
import { Engine, createApp } from '../../lib/app.js';
import { ContractFactory, ethers, ContractInterface } from 'ethers';

const logger = pino();
const privateKey = Buffer.from(privateKeyHex, 'hex');

export async function startServer(): Promise<any> {
  const engine = await Engine.connect(
    {
      network: config.network,
      endpoint: config.endpoint,
      contract: config.engine,
      signer: config.signer,
    },
    {}
  );
  return await createApp(config, logger, engine);
}

export async function deployContract(
  contractName: string
): Promise<DeploymentResult> {
  const provider = ethers.getDefaultProvider(rpcProviderUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const abi: ContractInterface = contracts[contractName]?.abi
    ? (contracts[contractName]?.abi as ContractInterface)
    : '';
  const bytecode: string = contracts[contractName]?.bytecode as string;
  const factory = new ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  return {
    from: wallet.address,
    address: contract?.address ? contract.address : null,
    gas: gas,
    gasPrice: gasPrice,
    contract: contracts[contractName] ? contracts[contractName] : null,
  };
}

export function sleep(seconds: number, callback: any) {
  setTimeout(function () {
    callback();
  }, seconds * 1000);
}
