/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';
import request from 'supertest';
import { createServer } from '../helpers';

let web3: any;
let app: Promise<any>;

describe('eth_getLogs', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT']
    web3 = new Web3(`http://localhost:${port}`)
  })

  describe('without result', () => {
    test('should return [], with [] in topics params', async () => {
      const response = await web3.eth.getPastLogs({
        address: '0x23a824dD17d6571e1BAdd25A6247C685D6802985',
        fromBlock: '0x3ecdf57',
        toBlock: '0x3ece307',
        topics: [
          [],
          [
            '0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616',
          ],
        ],
      })

      expect(response).toEqual([])
    })

    test('should return [], with hash in topics params', async () => {
      const response = await web3.eth.getPastLogs({
        address: '0x23a824dD17d6571e1BAdd25A6247C685D6802985',
        fromBlock: '0x3ecdf57',
        toBlock: '0x3ece307',
        topics: [
          '0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616',
        ],
      })

      expect(response).toEqual([])
    })

    test('should return [], with double [] in topics params', async () => {
      const response = await web3.eth.getPastLogs({
        address: '0x23a824dD17d6571e1BAdd25A6247C685D6802985',
        fromBlock: '0x3ecdf57',
        toBlock: '0x3ece307',
        topics: [
          [],
          [],
          '0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616',
        ],
      })

      expect(response).toEqual([])
    })

    test('should return [], with double null in topics params', async () => {
      const response = await web3.eth.getPastLogs({
        address: '0x23a824dD17d6571e1BAdd25A6247C685D6802985',
        fromBlock: '0x3ecdf57',
        toBlock: '0x3ece307',
        topics: [
          null,
          null,
          '0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616',
        ],
      })

      expect(response).toEqual([])
    })

    test('should return [], with null in topics params', async () => {
      const response = await web3.eth.getPastLogs({
        address: '0x23a824dD17d6571e1BAdd25A6247C685D6802985',
        fromBlock: '0x3ecdf57',
        toBlock: '0x3ece307',
        topics: [
          null,
          [
            '0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616',
          ],
        ],
      })

      expect(response).toEqual([])
    })

    test('should return [], without topics param', async () => {
      const response = await web3.eth.getPastLogs({
        address: '0x23a824dD17d6571e1BAdd25A6247C685D6802985',
        fromBlock: '0x3ecdf57',
        toBlock: '0x3ece307',
      })

      expect(response).toEqual([])
    })
  })

  describe('with result', () => {
    test('should return logs, with hex as blocks, without topics in params', async () => {
      const response = await web3.eth.getPastLogs({
        address: '0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82',
        fromBlock: '0x57a3c04',
        toBlock: '0x57a3c04',
      })

      expect(response).toMatchInlineSnapshot(`
        Array [
          Object {
            "address": "0xDdF079d2f486F1bA8D5cBC0900E6a12C6F91FF82",
            "blockHash": "0xeb5e60342d3287697a8c2c650cd3dd5df73ceb07cd5b55a84ed4fd205db7e2f2",
            "blockNumber": 91896836,
            "data": "0x000000000000000000000000000000000000000000000000000000035df15940000000000000000000000000aa2666def065cbd1f16d2c3c296c0b3287ea2827",
            "id": "log_fca0bc00",
            "logIndex": 0,
            "removed": false,
            "topics": Array [
              "0x17eabd0a66fa631f7537cefdd5df6aa25d5ac904cf7596e958d43a75a00d0d68",
              "0x000000000000000000000000000000000000000000000000000000000000494b",
            ],
            "transactionHash": "0x5c33068b145d9028087d0a69db07c612f292dc9274323c73dafb7d37c1354549",
            "transactionIndex": 0,
          },
        ]
      `)
    })

    test('should return logs, with number as blocks, without topics in params', async () => {
      const response = await web3.eth.getPastLogs({
        address: '0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82',
        fromBlock: 91896836,
        toBlock: 91896836,
      })

      expect(response).toMatchInlineSnapshot(`
        Array [
          Object {
            "address": "0xDdF079d2f486F1bA8D5cBC0900E6a12C6F91FF82",
            "blockHash": "0xeb5e60342d3287697a8c2c650cd3dd5df73ceb07cd5b55a84ed4fd205db7e2f2",
            "blockNumber": 91896836,
            "data": "0x000000000000000000000000000000000000000000000000000000035df15940000000000000000000000000aa2666def065cbd1f16d2c3c296c0b3287ea2827",
            "id": "log_fca0bc00",
            "logIndex": 0,
            "removed": false,
            "topics": Array [
              "0x17eabd0a66fa631f7537cefdd5df6aa25d5ac904cf7596e958d43a75a00d0d68",
              "0x000000000000000000000000000000000000000000000000000000000000494b",
            ],
            "transactionHash": "0x5c33068b145d9028087d0a69db07c612f292dc9274323c73dafb7d37c1354549",
            "transactionIndex": 0,
          },
        ]
      `)
    })

    test('should return logs, with [] in topics params', async () => {
      const response = await web3.eth.getPastLogs({
        address: '0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82',
        fromBlock: '0x57a3c04',
        toBlock: '0x57a3c04',
        topics: [
          [],
          [
            '0x000000000000000000000000000000000000000000000000000000000000494b',
            '0x0000000000000000000000000000000000000000000000000000000000004941',
          ],
        ],
      })

      expect(response).toMatchInlineSnapshot(`
        Array [
          Object {
            "address": "0xDdF079d2f486F1bA8D5cBC0900E6a12C6F91FF82",
            "blockHash": "0xeb5e60342d3287697a8c2c650cd3dd5df73ceb07cd5b55a84ed4fd205db7e2f2",
            "blockNumber": 91896836,
            "data": "0x000000000000000000000000000000000000000000000000000000035df15940000000000000000000000000aa2666def065cbd1f16d2c3c296c0b3287ea2827",
            "id": "log_fca0bc00",
            "logIndex": 0,
            "removed": false,
            "topics": Array [
              "0x17eabd0a66fa631f7537cefdd5df6aa25d5ac904cf7596e958d43a75a00d0d68",
              "0x000000000000000000000000000000000000000000000000000000000000494b",
            ],
            "transactionHash": "0x5c33068b145d9028087d0a69db07c612f292dc9274323c73dafb7d37c1354549",
            "transactionIndex": 0,
          },
        ]
      `)
    })

    test('should return logs, with null in topics params', async () => {
      const response = await web3.eth.getPastLogs({
        address: '0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82',
        fromBlock: '0x57a3c04',
        toBlock: '0x57a3c04',
        topics: [
          null,
          '0x000000000000000000000000000000000000000000000000000000000000494b',
        ],
      })

      expect(response).toMatchInlineSnapshot(`
        Array [
          Object {
            "address": "0xDdF079d2f486F1bA8D5cBC0900E6a12C6F91FF82",
            "blockHash": "0xeb5e60342d3287697a8c2c650cd3dd5df73ceb07cd5b55a84ed4fd205db7e2f2",
            "blockNumber": 91896836,
            "data": "0x000000000000000000000000000000000000000000000000000000035df15940000000000000000000000000aa2666def065cbd1f16d2c3c296c0b3287ea2827",
            "id": "log_fca0bc00",
            "logIndex": 0,
            "removed": false,
            "topics": Array [
              "0x17eabd0a66fa631f7537cefdd5df6aa25d5ac904cf7596e958d43a75a00d0d68",
              "0x000000000000000000000000000000000000000000000000000000000000494b",
            ],
            "transactionHash": "0x5c33068b145d9028087d0a69db07c612f292dc9274323c73dafb7d37c1354549",
            "transactionIndex": 0,
          },
        ]
      `)
    })

    describe('with empty topics params', () => {
      beforeAll(async () => {
        app = await createServer({
          attachAppToPort: false,
        })
      })

      test('should return logs, just null in topics params', async () => {
        const response = await web3.eth.getPastLogs({
          address: '0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82',
          fromBlock: '0x57a3c04',
          toBlock: '0x57a3c04',
          topics: [null],
        })

        expect(response).toMatchInlineSnapshot(`
          Array [
            Object {
              "address": "0xDdF079d2f486F1bA8D5cBC0900E6a12C6F91FF82",
              "blockHash": "0xeb5e60342d3287697a8c2c650cd3dd5df73ceb07cd5b55a84ed4fd205db7e2f2",
              "blockNumber": 91896836,
              "data": "0x000000000000000000000000000000000000000000000000000000035df15940000000000000000000000000aa2666def065cbd1f16d2c3c296c0b3287ea2827",
              "id": "log_fca0bc00",
              "logIndex": 0,
              "removed": false,
              "topics": Array [
                "0x17eabd0a66fa631f7537cefdd5df6aa25d5ac904cf7596e958d43a75a00d0d68",
                "0x000000000000000000000000000000000000000000000000000000000000494b",
              ],
              "transactionHash": "0x5c33068b145d9028087d0a69db07c612f292dc9274323c73dafb7d37c1354549",
              "transactionIndex": 0,
            },
          ]
        `)
      })

      test('should return logs, just few null in topics params', async () => {
        const response = await web3.eth.getPastLogs({
          address: '0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82',
          fromBlock: '0x57a3c04',
          toBlock: '0x57a3c04',
          topics: [null, null, null, null],
        })

        expect(response).toMatchInlineSnapshot(`
          Array [
            Object {
              "address": "0xDdF079d2f486F1bA8D5cBC0900E6a12C6F91FF82",
              "blockHash": "0xeb5e60342d3287697a8c2c650cd3dd5df73ceb07cd5b55a84ed4fd205db7e2f2",
              "blockNumber": 91896836,
              "data": "0x000000000000000000000000000000000000000000000000000000035df15940000000000000000000000000aa2666def065cbd1f16d2c3c296c0b3287ea2827",
              "id": "log_fca0bc00",
              "logIndex": 0,
              "removed": false,
              "topics": Array [
                "0x17eabd0a66fa631f7537cefdd5df6aa25d5ac904cf7596e958d43a75a00d0d68",
                "0x000000000000000000000000000000000000000000000000000000000000494b",
              ],
              "transactionHash": "0x5c33068b145d9028087d0a69db07c612f292dc9274323c73dafb7d37c1354549",
              "transactionIndex": 0,
            },
          ]
        `)
      })

      test('should return logs, just few [] in topics params', async () => {
        const response = await web3.eth.getPastLogs({
          address: '0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82',
          fromBlock: '0x57a3c04',
          toBlock: '0x57a3c04',
          topics: [[], [], [], []],
        })

        expect(response).toMatchInlineSnapshot(`
          Array [
            Object {
              "address": "0xDdF079d2f486F1bA8D5cBC0900E6a12C6F91FF82",
              "blockHash": "0xeb5e60342d3287697a8c2c650cd3dd5df73ceb07cd5b55a84ed4fd205db7e2f2",
              "blockNumber": 91896836,
              "data": "0x000000000000000000000000000000000000000000000000000000035df15940000000000000000000000000aa2666def065cbd1f16d2c3c296c0b3287ea2827",
              "id": "log_fca0bc00",
              "logIndex": 0,
              "removed": false,
              "topics": Array [
                "0x17eabd0a66fa631f7537cefdd5df6aa25d5ac904cf7596e958d43a75a00d0d68",
                "0x000000000000000000000000000000000000000000000000000000000000494b",
              ],
              "transactionHash": "0x5c33068b145d9028087d0a69db07c612f292dc9274323c73dafb7d37c1354549",
              "transactionIndex": 0,
            },
          ]
        `)
      })

      test('should return logs, just empty array in topics params', async () => {
        const response = await web3.eth.getPastLogs({
          address: '0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82',
          fromBlock: '0x57a3c04',
          toBlock: '0x57a3c04',
          topics: [[]],
        })

        expect(response).toMatchInlineSnapshot(`
          Array [
            Object {
              "address": "0xDdF079d2f486F1bA8D5cBC0900E6a12C6F91FF82",
              "blockHash": "0xeb5e60342d3287697a8c2c650cd3dd5df73ceb07cd5b55a84ed4fd205db7e2f2",
              "blockNumber": 91896836,
              "data": "0x000000000000000000000000000000000000000000000000000000035df15940000000000000000000000000aa2666def065cbd1f16d2c3c296c0b3287ea2827",
              "id": "log_fca0bc00",
              "logIndex": 0,
              "removed": false,
              "topics": Array [
                "0x17eabd0a66fa631f7537cefdd5df6aa25d5ac904cf7596e958d43a75a00d0d68",
                "0x000000000000000000000000000000000000000000000000000000000000494b",
              ],
              "transactionHash": "0x5c33068b145d9028087d0a69db07c612f292dc9274323c73dafb7d37c1354549",
              "transactionIndex": 0,
            },
          ]
        `)
      })

      test('should return logs, empty array and null in topics params', async () => {
        const response = await web3.eth.getPastLogs({
          address: '0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82',
          fromBlock: '0x57a3c04',
          toBlock: '0x57a3c04',
          topics: [[], null],
        })

        expect(response).toMatchInlineSnapshot(`
          Array [
            Object {
              "address": "0xDdF079d2f486F1bA8D5cBC0900E6a12C6F91FF82",
              "blockHash": "0xeb5e60342d3287697a8c2c650cd3dd5df73ceb07cd5b55a84ed4fd205db7e2f2",
              "blockNumber": 91896836,
              "data": "0x000000000000000000000000000000000000000000000000000000035df15940000000000000000000000000aa2666def065cbd1f16d2c3c296c0b3287ea2827",
              "id": "log_fca0bc00",
              "logIndex": 0,
              "removed": false,
              "topics": Array [
                "0x17eabd0a66fa631f7537cefdd5df6aa25d5ac904cf7596e958d43a75a00d0d68",
                "0x000000000000000000000000000000000000000000000000000000000000494b",
              ],
              "transactionHash": "0x5c33068b145d9028087d0a69db07c612f292dc9274323c73dafb7d37c1354549",
              "transactionIndex": 0,
            },
          ]
        `)
      })

      test('should return logs, null in array in topics params', async () => {
        const response = await web3.eth.getPastLogs({
          address: '0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82',
          fromBlock: '0x57a3c04',
          toBlock: '0x57a3c04',
          topics: [[null], null],
        })

        expect(response).toMatchInlineSnapshot(`
          Array [
            Object {
              "address": "0xDdF079d2f486F1bA8D5cBC0900E6a12C6F91FF82",
              "blockHash": "0xeb5e60342d3287697a8c2c650cd3dd5df73ceb07cd5b55a84ed4fd205db7e2f2",
              "blockNumber": 91896836,
              "data": "0x000000000000000000000000000000000000000000000000000000035df15940000000000000000000000000aa2666def065cbd1f16d2c3c296c0b3287ea2827",
              "id": "log_fca0bc00",
              "logIndex": 0,
              "removed": false,
              "topics": Array [
                "0x17eabd0a66fa631f7537cefdd5df6aa25d5ac904cf7596e958d43a75a00d0d68",
                "0x000000000000000000000000000000000000000000000000000000000000494b",
              ],
              "transactionHash": "0x5c33068b145d9028087d0a69db07c612f292dc9274323c73dafb7d37c1354549",
              "transactionIndex": 0,
            },
          ]
        `)
      })

      test('should return logs, null and empty array in array in topics params', async () => {
        const response = await request(app)
          .post('/')
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getLogs',
            params: [
              {
                address: '0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82',
                fromBlock: '0x57a3c04',
                toBlock: '0x57a3c04',
                topics: [[null, []]],
              },
            ],
          })

        expect(response.body.result).toMatchInlineSnapshot(`
          Array [
            Object {
              "address": "0xddf079d2f486f1ba8d5cbc0900e6a12c6f91ff82",
              "blockHash": "0xeb5e60342d3287697a8c2c650cd3dd5df73ceb07cd5b55a84ed4fd205db7e2f2",
              "blockNumber": "0x57a3c04",
              "data": "0x000000000000000000000000000000000000000000000000000000035df15940000000000000000000000000aa2666def065cbd1f16d2c3c296c0b3287ea2827",
              "logIndex": "0x0",
              "removed": false,
              "topics": Array [
                "0x17eabd0a66fa631f7537cefdd5df6aa25d5ac904cf7596e958d43a75a00d0d68",
                "0x000000000000000000000000000000000000000000000000000000000000494b",
              ],
              "transactionHash": "0x5c33068b145d9028087d0a69db07c612f292dc9274323c73dafb7d37c1354549",
              "transactionIndex": "0x0",
            },
          ]
        `)
      })
    })
  })
})
