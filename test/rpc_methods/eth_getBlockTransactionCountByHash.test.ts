/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getBlockTransactionCountByHash', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT'];
    web3 = new Web3(`http://localhost:${port}`)
  })

  test(`should return 0 for block that doesn't exist`, async () => {
    const response = await web3.eth.getBlockTransactionCount('0x8e1431a5acd7039dc8baee870ea75e496aa0b030b54638c91c47d2dea6522ca2')

    expect(response).toBe(0)
  })

  test(`should return transactions count for block`, async () => {
    const response = await web3.eth.getBlockTransactionCount('0xfafdeeba634974d9dba58ff084f621666ad2fa7c292fbd48f2ee76ecfdc62ce1')

    expect(response).toBe(1)
  })
})
