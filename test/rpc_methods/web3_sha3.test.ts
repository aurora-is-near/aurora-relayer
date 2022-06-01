/* This is free and unencumbered software released into the public domain. */

import { createServer } from '../helpers';
import request from 'supertest';

let app: Promise<any>;

describe('web3_sha3', () => {
  beforeAll(async () => {
    app = await createServer({
      attachAppToPort: false
    })
  })

  test('should return Keccak-256', async () => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'web3_sha3',
        params: ['0x68656c6c6f20776f726c64'],
      })

    expect(response.body.result).toBe(`0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad`)
  })

  test('should return error with params are empty', async () => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'web3_sha3',
        params: [],
      })

    const error = response.body.error

    expect(error.code).toBe(-32603)
    expect(error.message).toContain('Internal Error - This method only supports 0x-prefixed hex strings but input was: undefined')
  })
})
