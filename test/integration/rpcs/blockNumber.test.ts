/* This is free and unencumbered software released into the public domain. */
import request from 'supertest';
import { startServer } from '../testHelper';

describe('eth_getBalance', () => {
  let app: any;
  beforeAll(async () => {
    app = await startServer();
  });

  test('get block number', async () => {
    const response = await request(app).post('/').send({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_blockNumber',
      params: [],
    });
    expect(parseInt(response.body.result)).toBeGreaterThan(0);
  });
});
