/* This is free and unencumbered software released into the public domain. */

import { createServer } from '../helpers';
import Web3 from 'web3';

let web3: any;

describe('eth_getLogs', () => {
  beforeAll(async () => {
    const app = await createServer();
    const port = app.address().port;
    web3 = new Web3(`http://localhost:${port}`)
  })

  test('should return [], with [] in topics params', async () => {
    const response = await web3.eth.getPastLogs({
      address: "0x23a824dD17d6571e1BAdd25A6247C685D6802985",
      fromBlock: "0x3ecdf57",
      toBlock: "0x3ece307",
      topics: [
          [],
          ["0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616"]
      ]
    })

    expect(response).toEqual([])
  })

  test('should return [], with hash in topics params', async () => {
    const response = await web3.eth.getPastLogs({
      address: "0x23a824dD17d6571e1BAdd25A6247C685D6802985",
      fromBlock: "0x3ecdf57",
      toBlock: "0x3ece307",
      topics: ["0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616"]
    })

    expect(response).toEqual([])
  })

  test('should return [], with double [] in topics params', async () => {
    const response = await web3.eth.getPastLogs({
      address: "0x23a824dD17d6571e1BAdd25A6247C685D6802985",
      fromBlock: "0x3ecdf57",
      toBlock: "0x3ece307",
      topics: [
        [],
        [],
        "0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616"
      ]
    })

    expect(response).toEqual([])
  })

  test('should return [], with double null in topics params', async () => {
    const response = await web3.eth.getPastLogs({
      address: "0x23a824dD17d6571e1BAdd25A6247C685D6802985",
      fromBlock: "0x3ecdf57",
      toBlock: "0x3ece307",
      topics: [
        null,
        null,
        "0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616"
      ]
    })

    expect(response).toEqual([])
  })

  test('should return [], with null in topics params', async () => {
    const response = await web3.eth.getPastLogs({
      address: "0x23a824dD17d6571e1BAdd25A6247C685D6802985",
      fromBlock: "0x3ecdf57",
      toBlock: "0x3ece307",
      topics: [
          null,
          ["0x000000000000000000000000fe28a27a95e51bb2604abd65375411a059371616"]
      ]
    })

    expect(response).toEqual([])
  })

  test('should return [], without topics param', async () => {
    const response = await web3.eth.getPastLogs({
      address: "0x23a824dD17d6571e1BAdd25A6247C685D6802985",
      fromBlock: "0x3ecdf57",
      toBlock: "0x3ece307"
    })

    expect(response).toEqual([])
  })
})
