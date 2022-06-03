/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_blockNumber', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT'];
    web3 = new Web3(`http://localhost:${port}`)
  })

  test('should return block', async () => {
    const response = await web3.eth.getBlockNumber()

    expect(response).toBeGreaterThan(0)
  })
})
