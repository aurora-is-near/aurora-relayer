/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getTransactionCount', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT'];
    web3 = new Web3(`http://localhost:${port}`)
  })

  test(`should return data for address with transactions`, async () => {
    const response = await web3.eth.getTransactionCount('0x23a824dD17d6571e1BAdd25A6247C685D6802985', 'latest')

    expect(response).toBeGreaterThan(0)
  })

  test(`should return 0 for address without transactions`, async () => {
    const response = await web3.eth.getTransactionCount('0x1Ca3285DA521EC7ee20e3Ca72b7cd9e890F03906', 'latest')

    expect(response).toBe(0)
  })
})
