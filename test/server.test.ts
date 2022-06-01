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
