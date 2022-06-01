/* This is free and unencumbered software released into the public domain. */

import { createServer } from '../helpers';
import Web3 from 'web3';

let web3: any;

describe('eth_getBlockTransactionCountByHash', () => {
  beforeAll(async () => {
    const app = await createServer();
    const port = app.address().port;
    web3 = new Web3(`http://localhost:${port}`)
  })

  test(`should return 0 for block that doesn't exist`, async () => {
    const response = await web3.eth.getBlockTransactionCount('0x8e1431a5acd7039dc8baee870ea75e496aa0b030b54638c91c47d2dea6522ca2')

    expect(response).toBe(0)
  })
})
