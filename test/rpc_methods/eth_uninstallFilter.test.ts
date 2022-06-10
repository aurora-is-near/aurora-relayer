/* This is free and unencumbered software released into the public domain. */

import { createServer } from '../helpers';
import request from 'supertest';

let app: Promise<any>;

describe('eth_uninstallFilter', () => {
  beforeAll(async () => {
    app = await createServer({
      attachAppToPort: false
    })
  })

  test('should uninstall eth_newFilter', async () => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_newFilter',
        params: [{}],
      })

    const filterHash = response.body.result
    expect(filterHash).toContain(`0x`)
    expect(filterHash).not.toBe('0x00000000000000000000000000000000')

    const responseAfterUninstall = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_uninstallFilter',
        params: [filterHash],
      })

    expect(responseAfterUninstall.body.result).toBeTruthy()

    const responseGetFilterChanges = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getFilterChanges',
        params: [filterHash],
      })

    expect(responseGetFilterChanges.body.error.code).toBe(-32000)
    expect(responseGetFilterChanges.body.error.message).toBe('filter not found')
  })

  test('should uninstall eth_newBlockFilter', async () => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_newBlockFilter',
        params: [{}],
      })

    const filterHash = response.body.result
    expect(filterHash).toContain(`0x`)
    expect(filterHash).not.toBe('0x00000000000000000000000000000000')

    const responseAfterUninstall = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_uninstallFilter',
        params: [filterHash],
      })

    expect(responseAfterUninstall.body.result).toBeTruthy()

    const responseGetFilterChanges = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getFilterChanges',
        params: [filterHash],
      })

    expect(responseGetFilterChanges.body.error.code).toBe(-32000)
    expect(responseGetFilterChanges.body.error.message).toBe('filter not found')
  })
})
