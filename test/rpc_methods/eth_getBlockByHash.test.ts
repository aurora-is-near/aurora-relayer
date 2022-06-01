/* This is free and unencumbered software released into the public domain. */

import { createServer } from '../helpers';
import Web3 from 'web3';

let web3: any;

describe('eth_getBlockByHash', () => {
  beforeAll(async () => {
    const app = await createServer();
    const port = app.address().port;
    web3 = new Web3(`http://localhost:${port}`)
  })

  test(`should return null for block that doesn't exist`, async () => {
    const response = await web3.eth.getBlock("0x702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d6")

    expect(response).toBeNull()
  })

  test(`should return block by hash`, async () => {
    const latestBlock = await web3.eth.getBlock("latest")
    const response = await web3.eth.getBlock(latestBlock.hash)

    expect(response.hash).toHaveLength(66)
    expect(response.hash.startsWith('0x')).toBe(true)

    expect(response.number).toBeGreaterThanOrEqual(0)
  })
})
