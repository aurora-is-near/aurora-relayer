/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getBlockByNumber', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT'];
    web3 = new Web3(`http://localhost:${port}`)
  })

  test(`should return latest block`, async () => {
    const response = await web3.eth.getBlock("latest")

    expect(response.hash).toHaveLength(66)
    expect(response.hash.startsWith('0x')).toBe(true)

    expect(response.number).toBeGreaterThanOrEqual(0)
  })

  test(`should return block by number`, async () => {
    const latestBlock = await web3.eth.getBlock("latest")
    const response = await web3.eth.getBlock(latestBlock.number)

    expect(response.hash).toHaveLength(66)
    expect(response.hash.startsWith('0x')).toBe(true)

    expect(response.number).toBeGreaterThanOrEqual(0)
  })

  test(`should return null for block that doesn't exist`, async () => {
    const response = await web3.eth.getBlock(Number.MAX_SAFE_INTEGER)

    expect(response).toBeNull()
  })
})
