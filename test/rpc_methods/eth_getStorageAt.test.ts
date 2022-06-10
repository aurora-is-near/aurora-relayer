/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getStorageAt', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT'];
    web3 = new Web3(`http://localhost:${port}`)
  })

  test('should return storage position', async () => {
    const response = await web3.eth.getStorageAt("0x18a3612bcbb6df5b3bd30dbaec5ad321d3d1b4f9", "0x0", "latest")

    expect(response).toContain('0x')
    expect(response.length).toBe(66)
    expect(response).not.toBe('0x0000000000000000000000000000000000000000000000000000000000000000')
  })

  test('should return storage position for a non-existent address', async () => {
    const response = await web3.eth.getStorageAt("0x18a3612bcbb6df5b3bd30dbaec5ad321d3d1b4f1", "0x0", "latest")

    expect(response).toBe('0x0000000000000000000000000000000000000000000000000000000000000000')
  })
})
