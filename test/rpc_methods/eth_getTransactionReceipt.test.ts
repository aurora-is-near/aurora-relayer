/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_getTransactionReceipt', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT'];
    web3 = new Web3(`http://localhost:${port}`);
  })

  test(`should return null for transaction that doesn't exist`, async () => {
    const response = await web3.eth.getTransactionReceipt(
      '0x0878f605c76e154225d87638e5691940ba7a9704ff2cd35c664db005c632098c'
    )

    expect(response).toBeNull()
  })

  test(`should return transaction receipt`, async () => {
    const response = await web3.eth.getTransactionReceipt(
      '0x5C33068B145D9028087D0A69DB07C612F292DC9274323C73DAFB7D37C1354549'
    )

    expect(response).toMatchInlineSnapshot(`
      Object {
        "blockHash": "0xfafdeeba634974d9dba58ff084f621666ad2fa7c292fbd48f2ee76ecfdc62ce1",
        "blockNumber": 91896833,
        "contractAddress": null,
        "cumulativeGasUsed": 0,
        "from": "0xaa2666def065cbd1f16d2c3c296c0b3287ea2827",
        "gasUsed": 53310,
        "logs": Array [
          Object {
            "address": "0xDdF079d2f486F1bA8D5cBC0900E6a12C6F91FF82",
            "blockHash": "0xfafdeeba634974d9dba58ff084f621666ad2fa7c292fbd48f2ee76ecfdc62ce1",
            "blockNumber": 91896833,
            "data": "0x000000000000000000000000000000000000000000000000000000035df15940000000000000000000000000aa2666def065cbd1f16d2c3c296c0b3287ea2827",
            "id": "log_a2758b4f",
            "logIndex": 0,
            "removed": false,
            "topics": Array [
              "0x17eabd0a66fa631f7537cefdd5df6aa25d5ac904cf7596e958d43a75a00d0d68",
              "0x000000000000000000000000000000000000000000000000000000000000494b",
            ],
            "transactionHash": "0x5c33068b145d9028087d0a69db07c612f292dc9274323c73dafb7d37c1354549",
            "transactionIndex": 0,
          },
        ],
        "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "nearReceiptHash": "0x88bf609224db551b6c3bddc9cc6880c6b764e793d3b2fb46c34ca4c6216150d5",
        "nearTransactionHash": "0xdc94085d1da9890574f4e437975f8122666ca2276158af299a2ce961bce08aea",
        "status": true,
        "to": "0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82",
        "transactionHash": "0x5c33068b145d9028087d0a69db07c612f292dc9274323c73dafb7d37c1354549",
        "transactionIndex": 0,
      }
    `)
  })
})
