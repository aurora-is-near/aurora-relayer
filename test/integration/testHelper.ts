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
import { Engine } from '@aurora-is-near/engine';
import { createApp } from '../../lib/app.js';
import { ContractFactory, ethers, ContractInterface } from 'ethers';

const logger = pino();
const privateKey = Buffer.from(privateKeyHex, 'hex');
const provider = ethers.getDefaultProvider(rpcProviderUrl);
const wallet = new ethers.Wallet(privateKey, provider);

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

export async function sendRawTransaction(
  unsignedTx: ethers.providers.TransactionRequest
) {
  return await wallet.sendTransaction(unsignedTx);
}

export async function getWallet(): Promise<ethers.Wallet> {
  return wallet;
}

export async function getContractInstance(
  contractName: string,
  address: string
): Promise<ethers.Contract> {
  const abi: ContractInterface = contracts[contractName]?.abi
    ? (contracts[contractName]?.abi as ContractInterface)
    : '';
  const wallet = await getWallet();
  const contract = new ethers.Contract(address, abi, wallet);
  return contract.connect(wallet);
}

export async function deployContract(
  contractName: string
): Promise<DeploymentResult> {
  const abi: ContractInterface = contracts[contractName]?.abi
    ? (contracts[contractName]?.abi as ContractInterface)
    : '';
  const bytecode: string = contracts[contractName]?.bytecode as string;
  const factory = new ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  await contract.deployed();
  return {
    hash: contract.deployTransaction.hash,
    from: wallet.address,
    address: contract?.address ? contract.address : null,
    gas: gas,
    gasPrice: gasPrice,
    contract: contracts[contractName] ? contracts[contractName] : null,
    instance: contract,
    output: contracts[contractName]?.output
      ? contracts[contractName]?.output
      : '',
  };
}

export function sleep(seconds: number, callback: any) {
  setTimeout(function () {
    callback();
  }, seconds * 1000);
}
