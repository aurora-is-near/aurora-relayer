/* This is free and unencumbered software released into the public domain. */

import { createServer } from '../helpers';
import request from 'supertest';

let app: Promise<any>;

describe('eth_getFilterLogs', () => {
  beforeAll(async () => {
    app = await createServer({
      attachAppToPort: false
    })
  })

  test("should return error for filter which doesn't exists", async () => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getFilterLogs',
        params: ["0xfe704947a3cd3ca12541458a4321c869"],
      })

    const error = response.body.error

    expect(error.code).toBe(-32000)
    expect(error.message).toBe('filter not found')
  })
})
