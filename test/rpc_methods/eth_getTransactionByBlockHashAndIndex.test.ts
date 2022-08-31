/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getTransactionByBlockHashAndIndex', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT']
    web3 = new Web3(`http://localhost:${port}`)
  })

  test(`should return null for block that doesn't exist`, async () => {
    const response = await web3.eth.getTransactionFromBlock(
      '0x010b3538f64be7467b479f71ca96279817e33656f752b43ff256901b22596295',
      '0x1'
    )

    expect(response).toBeNull()
  })

  test(`should return transaction for block`, async () => {
    const response = await web3.eth.getTransactionFromBlock(
      '0xd1b4463e3d7773caadcf7229a94f8777c7815feddb5ba7d245b762c43595a2f1',
      '0x0'
    )

    expect(response).toMatchInlineSnapshot(`
      Object {
        "blockHash": "0xd1b4463e3d7773caadcf7229a94f8777c7815feddb5ba7d245b762c43595a2f1",
        "blockNumber": 91897217,
        "from": "0xAA2666DEF065cbd1F16D2C3C296c0b3287eA2827",
        "gas": 6721975,
        "gasPrice": "0",
        "hash": "0x661adbb4d1d36c919b284ec043584b538176a2f2d316cc3165b1470ff3993cf7",
        "input": "0x82b8ebc700000000000000000000000000000000000000000000000000000003663a5200",
        "nonce": 139434,
        "r": "0xe559e53801272702c3f1105748d9ebe118dc31d4694035c69c8772fcb8b8cad0",
        "s": "0x6428ff97292d6199b60f4586b839af965fc752889ff768c9f107667d8e7ae404",
        "to": "0xDdF079d2f486F1bA8D5cBC0900E6a12C6F91FF82",
        "transactionIndex": 0,
        "v": "0x9c8a82ca",
        "value": "0",
      }
    `)
  })
})
