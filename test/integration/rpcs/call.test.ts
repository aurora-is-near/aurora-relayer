/* This is free and unencumbered software released into the public domain. */
import request from 'supertest';
import { DeploymentResult } from '../types';
import { deployContract, sleep, startServer } from '../testHelper';

describe('eth_call', () => {
  let app: any, instance: DeploymentResult;

  beforeAll(async () => {
    app = await startServer();
    instance = await deployContract('sum');
  });

  test('call', async () => {
    // requires sleep for a couple of second till blockchain picks up the deployed contract.
    sleep(20, async () => {
      const response = await request(app)
        .post('/')
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [
            {
              from: instance.from,
              to: instance.address,
              gas: instance.gas,
              gasPrice: instance.gasPrice,
              value: '0x0',
              data: instance.contract?.data,
            },
            'latest',
          ],
        });
      expect(response.body.result).toEqual(instance.contract?.output);
    });
  });
});
