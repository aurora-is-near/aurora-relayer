/* This is free and unencumbered software released into the public domain. */
import request from 'supertest';
import { startServer } from '../testHelper';
import { publicKey } from '../constants';

describe('eth_getBalance', () => {
  let app: any;
  beforeAll(async () => {
    app = await startServer();
  });

  test('get zero balance', async () => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [publicKey],
      });
    expect(response.body.result).toEqual(`0x0`);
  });
});
