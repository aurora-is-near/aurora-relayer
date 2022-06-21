/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getUncleByBlockNumberAndIndex', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT'];
    web3 = new Web3(`http://localhost:${port}`)
  })

  test('should return null', async () => {
    const response = await web3.eth.getUncle(
      Number.MAX_SAFE_INTEGER,
      "0x0"
    )

    expect(response).toBeNull()
  })

  test('should return null, when block exists', async () => {
    const response = await web3.eth.getUncle(
      91897216,
      "0x0"
    )

    expect(response).toBeNull()
  })
})
