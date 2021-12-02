/* This is free and unencumbered software released into the public domain. */
import request from 'supertest';
import { deploySampleContract, sleep, startServer } from '../testHelper';

describe('eth_call', () => {
  let app: any, instance: any;

  beforeAll(async () => {
    app = await startServer();
    instance = await deploySampleContract();
  });

  test('call', async () => {
    // requires sleep for couple of second untill blockchain picks up the deployed contract.
    sleep(5, async () => {
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
              data: instance.data,
            },
            'latest',
          ],
        });
      expect(response.body.result).toEqual(instance.output);
    });
  });
});
