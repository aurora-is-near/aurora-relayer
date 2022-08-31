/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getUncleCountByBlockNumber', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT'];
    web3 = new Web3(`http://localhost:${port}`)
  })

  test('should return 0, when block exists', async () => {

    const latestBlock = await web3.eth.getBlock("latest")
    const fewBlocksAgo = await web3.eth.getBlock(latestBlock.number - 1)
    const response = await web3.eth.getBlockUncleCount(fewBlocksAgo.number)

    expect(response).toBe(0)
  })

  test(`should return null, when block doesn't exists`, async () => {
    const response = await web3.eth.getBlockUncleCount(Number.MAX_SAFE_INTEGER)

    expect(response).toBeNull()
  })

  test(`should return 0, when block exists`, async () => {
    const response = await web3.eth.getBlockUncleCount(91897217)

    expect(response).toBe(0)
  })
})
