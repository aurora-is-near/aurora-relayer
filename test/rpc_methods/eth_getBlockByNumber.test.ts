/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getBlockByNumber', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT']
    web3 = new Web3(`http://localhost:${port}`)
  })

  test(`should return latest block`, async () => {
    const response = await web3.eth.getBlock('latest')

    expect(response.hash).toHaveLength(66)
    expect(response.hash.startsWith('0x')).toBe(true)

    expect(response.number).toBeGreaterThanOrEqual(0)
  })

  test(`should return block by number`, async () => {
    const latestBlock = await web3.eth.getBlock('latest')
    const response = await web3.eth.getBlock(latestBlock.number)

    expect(response.hash).toHaveLength(66)
    expect(response.hash.startsWith('0x')).toBe(true)

    expect(response.number).toBeGreaterThanOrEqual(0)
  })

  test(`should return block by number, match snapshot`, async () => {
    const response = await web3.eth.getBlock(91896836)

    expect(response).toMatchInlineSnapshot(`
      Object {
        "difficulty": "0",
        "extraData": "0x",
        "gasLimit": 4503599627370495,
        "gasUsed": 53310,
        "hash": "0xeb5e60342d3287697a8c2c650cd3dd5df73ceb07cd5b55a84ed4fd205db7e2f2",
        "logsBloom": "0x00000008000000000000000000000000000000100000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000040000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000010000000000000000002000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "miner": "0x0000000000000000000000000000000000000000",
        "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "nonce": "0x0000000000000000",
        "number": 91896836,
        "parentHash": "0x098c739652ab10c44ff0d93fa6067b1b25d93968dab5defa0d12a9d15d638d81",
        "receiptsRoot": "0x5dea430287fd5418724a625f899236267ccc75cfc7108edd504d82e98717c3c5",
        "sha3Uncles": "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        "size": 363,
        "stateRoot": "0xa676d9c180a7b2115dd3670d4db04e1898e435924f05995d42111d617c0af420",
        "timestamp": 1654706959,
        "totalDifficulty": "0",
        "transactions": Array [
          "0x5c33068b145d9028087d0a69db07c612f292dc9274323c73dafb7d37c1354549",
        ],
        "transactionsRoot": "0x6802f1b7a76e495175277174c4039c358c743b723f2feb2395d812da1648b30b",
        "uncles": Array [],
      }
    `)
  })

  test(`should return null for block that doesn't exist`, async () => {
    const response = await web3.eth.getBlock(Number.MAX_SAFE_INTEGER)

    expect(response).toBeNull()
  })
})
