/* This is free and unencumbered software released into the public domain. */

import { createApp } from '../src/app';
import { Engine } from '@aurora-is-near/engine';
import externalConfig from 'config';
import { Config } from '../src/config';
import os from 'os';

import pino from 'pino';
import request from 'supertest';

let app: Promise<any>;

describe('AppServer', () => {
  beforeAll(async () => {
    const logger = pino();
    const engine = await Engine.connect((externalConfig as unknown) as Config, {
      HOME: os.homedir(),
    })
    app = await createApp(
      (externalConfig as unknown) as Config,
      logger,
      engine
    )
  })

  describe('JSON-RPC methods', () => {
    describe('eth_getBalance', () => {
      test('with 0 balance', async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getBalance',
            params: ['0x702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d6'],
          })

        expect(response.body.result).toEqual(`0x0`)
      })

      test('with some funds', async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getBalance',
            params: ['0x23a824dD17d6571e1BAdd25A6247C685D6802985'],
          })

        expect(response.body.result).toContain(`0x`)
        expect(response.body.result.length).toBe(18)
      })
    })

    describe('eth_getBlockByHash', () => {
      test("should return null for block that doesn't exist", async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getBlockByHash',
            params: [
              '0x8e1431a5acd7039dc8baee870ea75e496aa0b030b54638c91c47d2dea6522ca2',
            ],
          })

        expect(response.body.result).toBeNull()
      })
    })

    describe('eth_getBlockByNumber', () => {
      test("should return null for block that doesn't exist", async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getBlockByNumber',
            params: ['9999999970191245'],
          })

        expect(response.body.result).toBeNull()
      })
    })

    describe('eth_getBlockTransactionCountByHash', () => {
      test("should return 0x0 for block that doesn't exist", async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getBlockTransactionCountByHash',
            params: [
              '0x8e1431a5acd7039dc8baee870ea75e496aa0b030b54638c91c47d2dea6522ca2',
            ],
          })

        expect(response.body.result).toBe('0x0')
      })
    })

    describe('eth_getBlockTransactionCountByNumber', () => {
      test("should return 0x0 for block that doesn't exist", async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getBlockTransactionCountByNumber',
            params: ['999999999999999999'],
          })

        expect(response.body.result).toBe('0x0')
      })
    })

    describe('eth_getCode', () => {
      test('should return code of existed contract', async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getCode',
            params: ['0x02b93db565c9e2da73e9be058c4e303bbe414d9d'],
          })

        expect(response.body.result).toContain('0x')
        expect(response.body.result.length).toBe(240)
      })

      test("should return 0x for contract that doesn't exist", async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getCode',
            params: ['0x02b93db565c9e2da73e9be058c4e303bbe414d9c'],
          })

        expect(response.body.result).toBe('0x')
      })
    })

    describe('eth_getLogs', () => {
      test('should return [], with [] in topics params', async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getLogs',
            params: [{
              address: "0x23a824dD17d6571e1BAdd25A6247C685D6802985",
              fromBlock: "0x3ecdf57",
              toBlock: "0x3ece307",
              topics: [
                  [],
                  ["0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616"]
              ]
            }],
          })

        expect(response.body.result).toEqual([])
      })

      test('should return [], with hash in topics params', async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getLogs',
            params: [{
              address: "0x23a824dD17d6571e1BAdd25A6247C685D6802985",
              fromBlock: "0x3ecdf57",
              toBlock: "0x3ece307",
              topics: ["0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616"]
            }],
          })

        expect(response.body.result).toEqual([])
      })

      test('should return [], with double [] in topics params', async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getLogs',
            params: [{
              address: "0x23a824dD17d6571e1BAdd25A6247C685D6802985",
              fromBlock: "0x3ecdf57",
              toBlock: "0x3ece307",
              topics: [
                [],
                [],
                "0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616"
              ]
            }],
          })

        expect(response.body.result).toEqual([])
      })

      test('should return [], with double null in topics params', async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getLogs',
            params: [{
              address: "0x23a824dD17d6571e1BAdd25A6247C685D6802985",
              fromBlock: "0x3ecdf57",
              toBlock: "0x3ece307",
              topics: [
                null,
                null,
                "0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616"
              ]
            }],
          })

        expect(response.body.result).toEqual([])
      })

      test('should return [], with null in topics params', async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getLogs',
            params: [{
              address: "0x23a824dD17d6571e1BAdd25A6247C685D6802985",
              fromBlock: "0x3ecdf57",
              toBlock: "0x3ece307",
              topics: [
                  null,
                  ["0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616"]
              ]
            }],
          })

        expect(response.body.result).toEqual([])
      })

      test('should return [], without topics param', async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getLogs',
            params: [{
              address: "0x23a824dD17d6571e1BAdd25A6247C685D6802985",
              fromBlock: "0x3ecdf57",
              toBlock: "0x3ece307"
            }],
          })

        expect(response.body.result).toEqual([])
      })
    })

    describe('eth_getTransactionByBlockHashAndIndex', () => {
      test("should return null for block that doesn't exist", async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionByBlockHashAndIndex',
            params: [
              '0x010b3538f64be7467b479f71ca96279817e33656f752b43ff256901b22596295',
              '0x1',
            ],
          })

        expect(response.body.result).toBeNull()
      })
    })

    describe('eth_getTransactionByBlockNumberAndIndex', () => {
      test("should return null for block that doesn't exist", async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionByBlockNumberAndIndex',
            params: ['999999999999999999', '0x1'],
          })

        expect(response.body.result).toBeNull()
      })
    })

    describe('eth_getTransactionByHash', () => {
      test("should return null for transaction that doesn't exist", async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionByHash',
            params: [
              '0x926204a90109b89049965c3f31e862f0b0d1eb84103464d4d9f36fa9f037fee7',
            ],
          })

        expect(response.body.result).toBeNull()
      })
    })

    describe('eth_getTransactionCount', () => {
      test('should return data for address with transactions', async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionCount',
            params: ['0x23a824dD17d6571e1BAdd25A6247C685D6802985', 'latest'],
          })

        expect(response.body.result).toContain('0x')
        expect(response.body.result).not.toBe('0x0')
      })

      test('should return 0x0 for address without transactions', async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionCount',
            params: ['0x1Ca3285DA521EC7ee20e3Ca72b7cd9e890F03906', 'latest'],
          })

        expect(response.body.result).toBe('0x0')
      })
    })

    describe('eth_getTransactionReceipt', () => {
      test("should return null for transaction that doesn't exist", async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionReceipt',
            params: [
              '0x0878f605c76e154225d87638e5691940ba7a9704ff2cd35c664db005c632098c',
            ],
          })

        expect(response.body.result).toBeNull()
      })
    })

    describe('eth_newBlockFilter', () => {
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

    describe('eth_newFilter', () => {
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

    describe('eth_newPendingTransactionFilter', () => {
      test('should return correct value', async () => {
        const response = await request(app).post('/').send({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_newPendingTransactionFilter',
          params: [],
        })

        expect(response.body.result).toContain(`0x`)
        expect(response.body.result.length).toBe(34)
      })
    })
  })

  describe('Aurora-Process-Result headers', () => {
    test('array of eth_sendRawTransaction and eth_getCode, result and header should present', async () => {
      const response = await request(app)
        .post('/')
        .send([
          {
            jsonrpc: '2.0',
            method: 'eth_sendRawTransaction',
            params: [
              '0xf866820b2d80837a12009423a824dd17d6571e1badd25a6247c685d68029858080849c8a82caa0492c0061415907bbbe3f474e0ceb3b7a190042a5553666e3208c251a7d79a02ba035de2b41f11f877c8f938ea6b6be682e8276bcfa347e2c0923400a890657c883',
            ],
            id: 1,
          },
          {
            jsonrpc: '2.0',
            method: 'eth_sendRawTransaction',
            params: [
              '0xf8642d80837a120094ac2d0226ade52e6b4ccc97359359f01e34d503528080849c8a82c8a025b86590e2a8236e7cb5bbbb7a6e12ee1699c803f0f18163998a30223798f5faa00975dde1d880091fb47edb0769de9377ee7b640402e1dbe8b8778d32db3b5c7f',
            ],
            id: 2,
          },
          {
            jsonrpc: '2.0',
            method: 'eth_getCode',
            params: ['0x79898510Bf1cF4804AF0277D61745AD3703Ab73b'],
            id: 3,
          },
        ])

      const firstResponseTransaction = response.body[0]
      expect(firstResponseTransaction.id).toBe(1)
      expect(firstResponseTransaction.error.code).toBe(-32000)
      expect(firstResponseTransaction.error.message).toBe(
        'ERR_INCORRECT_NONCE'
      )
      expect(firstResponseTransaction).not.toHaveProperty('result')

      const secondResponseTransaction = response.body[1]
      expect(secondResponseTransaction.id).toBe(2)
      expect(secondResponseTransaction.error.code).toBe(-32000)
      expect(secondResponseTransaction.error.message).toBe(
        'ERR_INVALID_CHAIN_ID'
      )
      expect(secondResponseTransaction).not.toHaveProperty('result')

      const thirdResponseTransaction = response.body[2]
      expect(thirdResponseTransaction.id).toBe(3)
      expect(thirdResponseTransaction).not.toHaveProperty('error')
      expect(thirdResponseTransaction.result).toContain('0x6080604')

      const responseAuroraProcessResultHeaders = JSON.parse(
        response.headers['x-aurora-process-result']
      )

      expect(responseAuroraProcessResultHeaders).toHaveLength(3)

      expect(typeof responseAuroraProcessResultHeaders[0].neargas).toBe(
        'number'
      )
      expect(responseAuroraProcessResultHeaders[0]).toHaveProperty('tx')
      expect(responseAuroraProcessResultHeaders[0].error).toBe(
        'ERR_INCORRECT_NONCE'
      )

      expect(typeof responseAuroraProcessResultHeaders[1].neargas).toBe(
        'number'
      )
      expect(responseAuroraProcessResultHeaders[1]).toHaveProperty('tx')
      expect(responseAuroraProcessResultHeaders[1].error).toBe(
        'ERR_INVALID_CHAIN_ID'
      )

      expect(responseAuroraProcessResultHeaders[2]).toMatchObject({})
    })

    test('single eth_sendRawTransaction, result and header should present', async () => {
      const response = await request(app)
        .post('/')
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_sendRawTransaction',
          params: [
            '0xf866820b2d80837a12009423a824dd17d6571e1badd25a6247c685d68029858080849c8a82caa0492c0061415907bbbe3f474e0ceb3b7a190042a5553666e3208c251a7d79a02ba035de2b41f11f877c8f938ea6b6be682e8276bcfa347e2c0923400a890657c883',
          ],
        })

      expect(response.body.id).toBe(1)
      expect(response.body.error.code).toBe(-32000)
      expect(response.body.error.message).toBe('ERR_INCORRECT_NONCE')

      const responseAuroraProcessResultHeaders = JSON.parse(
        response.headers['x-aurora-process-result']
      )

      expect(responseAuroraProcessResultHeaders).toHaveLength(1)
      expect(typeof responseAuroraProcessResultHeaders[0].neargas).toBe(
        'number'
      )
      expect(responseAuroraProcessResultHeaders[0]).toHaveProperty('tx')
      expect(responseAuroraProcessResultHeaders[0].error).toBe(
        'ERR_INCORRECT_NONCE'
      )
    })

    test('array eth_getCode, result should present, headers should be skipped', async () => {
      const response = await request(app)
        .post('/')
        .send([
          {
            jsonrpc: '2.0',
            method: 'eth_getCode',
            params: ['0x6d7a65d4e761ae5f6832735db18e2c32132d7ff9'],
            id: 1,
          },
          {
            jsonrpc: '2.0',
            method: 'eth_getCode',
            params: ['0x79898510Bf1cF4804AF0277D61745AD3703Ab73b'],
            id: 2,
          },
        ])

      expect(response.body).toHaveLength(2)

      const firstResponseTransaction = response.body[0]
      expect(firstResponseTransaction.id).toBe(1)
      expect(firstResponseTransaction).not.toHaveProperty('error')
      expect(firstResponseTransaction.result).toContain('0x6080604')

      const secondResponseTransaction = response.body[1]
      expect(secondResponseTransaction.id).toBe(2)
      expect(secondResponseTransaction).not.toHaveProperty('error')
      expect(secondResponseTransaction.result).toContain('0x6080604')

      expect(response.headers).not.toHaveProperty('x-aurora-process-result')
    })

    test('single eth_getCode, result should present, headers should be skipped', async () => {
      const response = await request(app)
        .post('/')
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getCode',
          params: ['0x79898510Bf1cF4804AF0277D61745AD3703Ab73b'],
        })

      expect(response.body.id).toBe(1)
      expect(response.body).not.toHaveProperty('error')
      expect(response.body.result).toContain('0x6080604')

      expect(response.headers).not.toHaveProperty('x-aurora-process-result')
    })
  })
})
