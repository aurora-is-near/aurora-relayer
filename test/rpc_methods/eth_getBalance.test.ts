/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getBalance', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT'];
    web3 = new Web3(`http://localhost:${port}`)
  })

  test('with 0 balance', async () => {
    const response = await web3.eth.getBalance("0x702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d6")

    expect(response).toBe("0")
  })

  test('with some funds', async () => {
    const response = await web3.eth.getBalance("0x23a824dD17d6571e1BAdd25A6247C685D6802985")

    expect(response).not.toBe("0")
  })
})
