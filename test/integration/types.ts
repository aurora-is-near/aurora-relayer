/* This is free and unencumbered software released into the public domain. */

import { ContractInterface } from 'ethers';

export type Contract = {
  abi: ContractInterface;
  bytecode: string;
  data?: string;
  output?: string;
};

export type DeploymentResult = {
  from: string;
  address: string | null;
  gas: string;
  gasPrice: string;
  contract: Partial<Contract> | null | undefined;
};
