/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getUncleCountByBlockHash', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT'];
    web3 = new Web3(`http://localhost:${port}`)
  })

  test('should return 0, when block exists', async () => {

    const latestBlock = await web3.eth.getBlock("latest")
    const fewBlocksAgo = await web3.eth.getBlock(latestBlock.number - 3)
    const response = await web3.eth.getBlockUncleCount(fewBlocksAgo.hash)

    expect(response).toBe(0)
  })

  test(`should return null, when block doesn't exists`, async () => {
    const response = await web3.eth.getBlockUncleCount(`0x${'0'.repeat(64)}`)

    expect(response).toBeNull()
  })
})
