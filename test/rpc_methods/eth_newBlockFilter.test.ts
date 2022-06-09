/* This is free and unencumbered software released into the public domain. */

import { createServer } from '../helpers';
import request from 'supertest';

let app: Promise<any>;

describe('eth_newBlockFilter', () => {
  beforeAll(async () => {
    app = await createServer({
      attachAppToPort: false
    })
  })

  test('should return correct value', async () => {
    const response = await request(app).post('/').send({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_newBlockFilter',
      params: [],
    })

    expect(response.body.result).toContain(`0x`)
    expect(response.body.result.length).toBe(34)
  })
})
