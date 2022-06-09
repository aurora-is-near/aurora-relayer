/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getTransactionReceipt', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT'];
    web3 = new Web3(`http://localhost:${port}`)
  })

  test(`should return null for transaction that doesn't exist`, async () => {
    const response = await web3.eth.getTransactionReceipt('0x0878f605c76e154225d87638e5691940ba7a9704ff2cd35c664db005c632098c')

    expect(response).toBeNull()
  })
})
