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

  test('should return correct value', async () => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_newFilter',
        params: [{}],
      })

    expect(response.body.result).toContain(`0x`)
    expect(response.body.result.length).toBe(34)
  })

  test('should return correct value, with address param', async () => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_newFilter',
        params: [
          {
            address: '0x0000000000000000000000000000000000000000',
          },
        ],
      })

    expect(response.body.result).toContain(`0x`)
    expect(response.body.result.length).toBe(34)
  })

  test('should return correct value, with fromBlock and toBlock params', async () => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_newFilter',
        params: [
          {
            fromBlock: 'earliest',
            toBlock: 'latest',
          },
        ],
      })

    expect(response.body.result).toContain(`0x`)
    expect(response.body.result.length).toBe(34)
  })
})
