/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getBlockTransactionCountByNumber', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT'];
    web3 = new Web3(`http://localhost:${port}`)
  })

  test(`should return 0 for block that doesn't exist`, async () => {
    const response = await web3.eth.getBlockTransactionCount('999999999999999999')

    expect(response).toBe(0)
  })
})
