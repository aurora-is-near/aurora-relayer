/* This is free and unencumbered software released into the public domain. */

import { createServer } from '../helpers';
import request from 'supertest';

let app: Promise<any>;

describe('eth_getFilterLogs', () => {
  beforeAll(async () => {
    app = await createServer({
      attachAppToPort: false,
    })
  })

  test("should return error for filter which doesn't exists", async () => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getFilterLogs',
        params: ['0xfe704947a3cd3ca12541458a4321c869'],
      })

    const error = response.body.error

    expect(error.code).toBe(-32000)
    expect(error.message).toBe('filter not found')
  })

  test('should return log object, with null in topics', async () => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_newFilter',
        params: [
          {
            address: '0x19161c50f5e2cd8be249c1031ee295546ba2756f',
            topics: [
              null,
              '0x00000000000000000000000032edfdb3947a7defa9569e3fcfdfa9a4d69b349d',
            ],
          },
        ],
      })

    expect(response.body.result).toContain(`0x`)
    expect(response.body.result.length).toBe(34)

    const filterHash = response.body.result

    const responseGetFilterLogs = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getFilterLogs',
        params: [filterHash],
      })

    expect(responseGetFilterLogs.body.result).toMatchInlineSnapshot(`
      Array [
        Object {
          "address": "0x19161c50f5e2cd8be249c1031ee295546ba2756f",
          "blockHash": "0x7d6ba4cb1daf8bf60983eea9695e1695a205374c11a8e99ab9241a9b203d03be",
          "blockNumber": "0x57a2ee1",
          "data": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "logIndex": "0x0",
          "removed": false,
          "topics": Array [
            "0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b",
            "0x00000000000000000000000032edfdb3947a7defa9569e3fcfdfa9a4d69b349d",
          ],
          "transactionHash": "0x865d5e8b34b7ed7b9596e85d992418f80a55ac6186002823ff002850cbc4aa47",
          "transactionIndex": "0x0",
        },
      ]
    `)
  })

  test('should return log object, with [] in topics', async () => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_newFilter',
        params: [
          {
            address: '0x19161c50f5e2cd8be249c1031ee295546ba2756f',
            topics: [
              [],
              '0x00000000000000000000000032edfdb3947a7defa9569e3fcfdfa9a4d69b349d',
            ],
          },
        ],
      })

    expect(response.body.result).toContain(`0x`)
    expect(response.body.result.length).toBe(34)

    const filterHash = response.body.result

    const responseGetFilterLogs = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getFilterLogs',
        params: [filterHash],
      })

    expect(responseGetFilterLogs.body.result).toMatchInlineSnapshot(`
      Array [
        Object {
          "address": "0x19161c50f5e2cd8be249c1031ee295546ba2756f",
          "blockHash": "0x7d6ba4cb1daf8bf60983eea9695e1695a205374c11a8e99ab9241a9b203d03be",
          "blockNumber": "0x57a2ee1",
          "data": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "logIndex": "0x0",
          "removed": false,
          "topics": Array [
            "0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b",
            "0x00000000000000000000000032edfdb3947a7defa9569e3fcfdfa9a4d69b349d",
          ],
          "transactionHash": "0x865d5e8b34b7ed7b9596e85d992418f80a55ac6186002823ff002850cbc4aa47",
          "transactionIndex": "0x0",
        },
      ]
    `)
  })

  test('should return log object, with address, fromBlock and toBlock', async () => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_newFilter',
        params: [
          {
            fromBlock: 91897216,
            toBlock: 91897216,
            address: '0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82',
          },
        ],
      })

    expect(response.body.result).toContain(`0x`)
    expect(response.body.result.length).toBe(34)

    const filterHash = response.body.result

    const responseGetFilterLogs = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getFilterLogs',
        params: [filterHash],
      })

    expect(responseGetFilterLogs.body.result).toMatchInlineSnapshot(`
      Array [
        Object {
          "address": "0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82",
          "blockHash": "0x0b7a7bbef2fdf7df5e4aeafe4f290150757fef8a980d7045302dbd468ddedeeb",
          "blockNumber": "0x57a3d80",
          "data": "0x00000000000000000000000000000000000000000000000000000003663a5200000000000000000000000000aa2666def065cbd1f16d2c3c296c0b3287ea2827",
          "logIndex": "0x0",
          "removed": false,
          "topics": Array [
            "0x17eabd0a66fa631f7537cefdd5df6aa25d5ac904cf7596e958d43a75a00d0d68",
            "0x000000000000000000000000000000000000000000000000000000000000494f",
          ],
          "transactionHash": "0x661adbb4d1d36c919b284ec043584b538176a2f2d316cc3165b1470ff3993cf7",
          "transactionIndex": "0x0",
        },
      ]
    `)
  })

  test('should return log object, without address, with fromBlock and toBlock', async () => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_newFilter',
        params: [
          {
            fromBlock: 91897216,
            toBlock: 91897216,
          },
        ],
      })

    expect(response.body.result).toContain(`0x`)
    expect(response.body.result.length).toBe(34)

    const filterHash = response.body.result

    const responseGetFilterLogs = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getFilterLogs',
        params: [filterHash],
      })

    expect(responseGetFilterLogs.body.result).toMatchInlineSnapshot(`
      Array [
        Object {
          "address": "0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82",
          "blockHash": "0x0b7a7bbef2fdf7df5e4aeafe4f290150757fef8a980d7045302dbd468ddedeeb",
          "blockNumber": "0x57a3d80",
          "data": "0x00000000000000000000000000000000000000000000000000000003663a5200000000000000000000000000aa2666def065cbd1f16d2c3c296c0b3287ea2827",
          "logIndex": "0x0",
          "removed": false,
          "topics": Array [
            "0x17eabd0a66fa631f7537cefdd5df6aa25d5ac904cf7596e958d43a75a00d0d68",
            "0x000000000000000000000000000000000000000000000000000000000000494f",
          ],
          "transactionHash": "0x661adbb4d1d36c919b284ec043584b538176a2f2d316cc3165b1470ff3993cf7",
          "transactionIndex": "0x0",
        },
      ]
    `)
  })

  test('should return error message, without params', async () => {
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

    const filterHash = response.body.result

    const responseGetFilterLogs = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getFilterLogs',
        params: [filterHash],
      })

    expect(responseGetFilterLogs.body.error.message).toBe('query returned more than 5 results')
  })
})
