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

  describe('different state of contract', () => {
    test('should return 0, with 0 block height', async () => {
      const response = await web3.eth.getStorageAt("0xB25269594f160a0Fd610089e83B28dB74016c36A", "0x0", "0")

      expect(response).toContain('0x')
      expect(response.length).toBe(66)
      expect(response).toBe('0x0000000000000000000000000000000000000000000000000000000000000000')
    })

    test('should return 0, with 0 as hex block height', async () => {
      const response = await web3.eth.getStorageAt("0xB25269594f160a0Fd610089e83B28dB74016c36A", "0x0", "0x0")

      expect(response).toContain('0x')
      expect(response.length).toBe(66)
      expect(response).toBe('0x0000000000000000000000000000000000000000000000000000000000000000')
    })

    test('should return 0, with earliest block height', async () => {
      const response = await web3.eth.getStorageAt("0xB25269594f160a0Fd610089e83B28dB74016c36A", "0x0", "earliest")

      expect(response).toContain('0x')
      expect(response.length).toBe(66)
      expect(response).toBe('0x0000000000000000000000000000000000000000000000000000000000000000')
    })

    test('should return 0, with genesis block height as hex', async () => {
      const response = await web3.eth.getStorageAt("0xB25269594f160a0Fd610089e83B28dB74016c36A", "0x0", "0x2d290fc")

      expect(response).toContain('0x')
      expect(response.length).toBe(66)
      expect(response).toBe('0x0000000000000000000000000000000000000000000000000000000000000000')
    })

    test('should return 1, with block height as number', async () => {
      const response = await web3.eth.getStorageAt("0xB25269594f160a0Fd610089e83B28dB74016c36A", "0x0", "109768418")

      expect(response).toContain('0x')
      expect(response.length).toBe(66)
      expect(response).toBe('0x0000000000000000000000000000000000000000000000000000000000000001')
    })

    test('should return 1, with block height as hex', async () => {
      const response = await web3.eth.getStorageAt("0xB25269594f160a0Fd610089e83B28dB74016c36A", "0x0", "0x68aeee2")

      expect(response).toContain('0x')
      expect(response.length).toBe(66)
      expect(response).toBe('0x0000000000000000000000000000000000000000000000000000000000000001')
    })

    test('should return 2, with block height as number', async () => {
      const response = await web3.eth.getStorageAt("0xB25269594f160a0Fd610089e83B28dB74016c36A", "0x0", "109768428")

      expect(response).toContain('0x')
      expect(response.length).toBe(66)
      expect(response).toBe('0x0000000000000000000000000000000000000000000000000000000000000002')
    })

    test('should return 3, with block height as number', async () => {
      const response = await web3.eth.getStorageAt("0xB25269594f160a0Fd610089e83B28dB74016c36A", "0x0", "109768447")

      expect(response).toContain('0x')
      expect(response.length).toBe(66)
      expect(response).toBe('0x0000000000000000000000000000000000000000000000000000000000000003')
    })

    test('should return storage position, with latest param', async () => {
      const response = await web3.eth.getStorageAt("0xB25269594f160a0Fd610089e83B28dB74016c36A", "0x0", "latest")

      expect(response).toContain('0x')
      expect(response.length).toBe(66)
      expect(response).not.toBe('0x0000000000000000000000000000000000000000000000000000000000000000')
    })

    test('should return storage position, with pending param', async () => {
      const response = await web3.eth.getStorageAt("0xB25269594f160a0Fd610089e83B28dB74016c36A", "0x0", "pending")

      expect(response).toContain('0x')
      expect(response.length).toBe(66)
      expect(response).not.toBe('0x0000000000000000000000000000000000000000000000000000000000000000')
    })
  })
})
