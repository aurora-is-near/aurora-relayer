/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getUncleByBlockHashAndIndex', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT'];
    web3 = new Web3(`http://localhost:${port}`)
  })

  test('should return null', async () => {
    const response = await web3.eth.getUncle(
      "0xc13eee2e7dc14762364d00584100bbe86c1faa97fc4694236cb5a928b2421330",
      "0x0"
    )

    expect(response).toBeNull()
  })
})
