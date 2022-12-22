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

  test('with some funds, latest', async () => {
    const response = await web3.eth.getBalance("0x23a824dD17d6571e1BAdd25A6247C685D6802985", "latest")

    expect(response).not.toBe("0")
  })

  test('with some funds, pending', async () => {
    const response = await web3.eth.getBalance("0x23a824dD17d6571e1BAdd25A6247C685D6802985", "pending")

    expect(response).not.toBe("0")
  })

  test('should return 0 for block before genesis', async () => {
    const response = await web3.eth.getBalance("0xd0f25eD95810A5F46A5d05b23529c019094A8cbE", "0x0")

    expect(response).toBe("0")
  })

  test('should return 0 for block before genesis, earliest', async () => {
    const response = await web3.eth.getBalance("0xd0f25eD95810A5F46A5d05b23529c019094A8cbE", "earliest")

    expect(response).toBe("0")
  })

  test('should return funds with block param as hex', async () => {
    const response = await web3.eth.getBalance("0xd0f25eD95810A5F46A5d05b23529c019094A8cbE", "0x5cbd59e")

    expect(response).toBe("98999998530000000000")
  })

  test('should return funds with block param as number', async () => {
    const response = await web3.eth.getBalance("0xd0f25eD95810A5F46A5d05b23529c019094A8cbE", "97244574")

    expect(response).toBe("98999998530000000000")
  })

  test('should return funds with block param as hex, case 2', async () => {
    const response = await web3.eth.getBalance("0xd0f25eD95810A5F46A5d05b23529c019094A8cbE", "0x5cbd6e6")

    expect(response).toBe("48999473530000000000")
  })
})
