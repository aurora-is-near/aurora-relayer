/* This is free and unencumbered software released into the public domain. */
import request from 'supertest';
import { startServer } from '../testHelper';

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
        params: ['0x702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d6'],
      });
    expect(response.body.result).toEqual(`0x0`);
  });
});
