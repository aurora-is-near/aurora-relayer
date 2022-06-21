/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getBlockByHash', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT']
    web3 = new Web3(`http://localhost:${port}`)
  })

  test(`should return null for block that doesn't exist`, async () => {
    const response = await web3.eth.getBlock(
      '0x702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d6'
    )

    expect(response).toBeNull()
  })

  test(`should return block by hash`, async () => {
    const latestBlock = await web3.eth.getBlock('latest')
    const response = await web3.eth.getBlock(latestBlock.hash)

    expect(response.hash).toHaveLength(66)
    expect(response.hash.startsWith('0x')).toBe(true)

    expect(response.number).toBeGreaterThanOrEqual(0)
  })

  test(`should return block by hash, match snapshot`, async () => {
    const response = await web3.eth.getBlock(
      '0xfafdeeba634974d9dba58ff084f621666ad2fa7c292fbd48f2ee76ecfdc62ce1'
    )

    expect(response).toMatchInlineSnapshot(`
      Object {
        "difficulty": "0",
        "extraData": "0x",
        "gasLimit": 0,
        "gasUsed": 0,
        "hash": "0xfafdeeba634974d9dba58ff084f621666ad2fa7c292fbd48f2ee76ecfdc62ce1",
        "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "miner": "0x0000000000000000000000000000000000000000",
        "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "nonce": "0x0000000000000000",
        "number": 91896833,
        "parentHash": "0x41e21a71f302a70853cc49e0b876c56867458f38200c792904be8c418675836c",
        "receiptsRoot": "0x3abf5db79c8b0856f1c3a547db4d6fd6b797dae1a17e58f59c9af946eec7e39c",
        "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "size": 1339,
        "stateRoot": "0xce08b5d80470391500ed7a9d429426307ebe12e994ece0c3dcd6fb29ee9c4e12",
        "timestamp": 1654706955,
        "totalDifficulty": "0",
        "transactions": Array [
          "0x5c33068b145d9028087d0a69db07c612f292dc9274323c73dafb7d37c1354549",
        ],
        "transactionsRoot": "0x9de199b19c7b5c1eb43bed4dd6a7e8d1101cb8593ce4cc882b75cf9ebc6c8fc5",
        "uncles": Array [],
      }
    `)
  })
})
