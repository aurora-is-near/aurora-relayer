/* This is free and unencumbered software released into the public domain. */

import { createServer } from '../helpers';
import request from 'supertest';

let app: Promise<any>;

describe('eth_newFilter', () => {
  beforeAll(async () => {
    app = await createServer({
      attachAppToPort: false
    })
  })

  test('should return []', async () => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_accounts',
        params: [],
      })

    expect(response.body.result).toEqual([])
  })
})
