/* This is free and unencumbered software released into the public domain. */
// import request from 'supertest';
import { DeploymentResult } from '../types';
import {
  deployContract,
  getWallet,
  getContractInstance,
  sleep,
} from '../testHelper';

describe('eth_getLogs', () => {
  let callee: DeploymentResult;

  beforeAll(async () => {
    callee = await deployContract('callee');
  });

  test('low level call - call', async () => {
    // requires sleep for a couple of second till blockchain picks up the deployed contract.
    const caller: DeploymentResult = await deployContract('lowLevelCallCaller');
    sleep(10, async () => {
      const wallet = await getWallet();
      const instance = await getContractInstance(
        'lowLevelCallCaller',
        caller.instance.address
      );
      if (instance.populateTransaction?.log) {
        const unsignedTx = await instance.populateTransaction?.log(
          callee.address
        );
        const tx = await (await wallet.sendTransaction(unsignedTx)).wait();
        console.log(tx);
        expect(tx?.logs[0]?.address).toEqual(caller.instance.address);
      }
    });
  });
  test('low level call - delegateCall', async () => {
    // requires sleep for a couple of second till blockchain picks up the deployed contract.
    const caller: DeploymentResult = await deployContract(
      'lowLevelCallDelegateCaller'
    );
    sleep(10, async () => {
      const wallet = await getWallet();
      const instance = await getContractInstance(
        'lowLevelCallDelegateCaller',
        caller.instance.address
      );
      if (instance.populateTransaction?.log) {
        const unsignedTx = await instance.populateTransaction?.log(
          callee.address
        );
        const tx = await (await wallet.sendTransaction(unsignedTx)).wait();
        console.log(tx);
        expect(tx?.logs[0]?.address).toEqual(callee.instance.address);
      }
    });
  });

  test('Direct contract call', async () => {
    // requires sleep for a couple of second till blockchain picks up the deployed contract.
    const caller: DeploymentResult = await deployContract(
      'directContractCaller'
    );
    sleep(10, async () => {
      const wallet = await getWallet();
      const instance = await getContractInstance(
        'directContractCaller',
        caller.instance.address
      );
      if (instance.populateTransaction?.log) {
        const unsignedTx = await instance.populateTransaction?.log(
          callee.address
        );
        const tx = await (await wallet.sendTransaction(unsignedTx)).wait();
        console.log(tx);
        expect(tx?.logs[0]?.address).toEqual(callee.instance.address);
      }
    });
  });
});
