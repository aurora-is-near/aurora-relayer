/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getBlockTransactionCountByNumber', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT'];
    web3 = new Web3(`http://localhost:${port}`)
  })

  test(`should return 0 for block that doesn't exist`, async () => {
    const response = await web3.eth.getBlockTransactionCount(Number.MAX_SAFE_INTEGER)

    expect(response).toBe(0)
  })

  test(`should return transactions count for block`, async () => {
    const response = await web3.eth.getBlockTransactionCount(91896836)

    expect(response).toBe(1)
  })
})
