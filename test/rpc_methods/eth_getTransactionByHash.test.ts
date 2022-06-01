/* This is free and unencumbered software released into the public domain. */

import { createServer } from '../helpers';
import Web3 from 'web3';

let web3: any;

describe('eth_getTransactionByHash', () => {
  beforeAll(async () => {
    const app = await createServer();
    const port = app.address().port;
    web3 = new Web3(`http://localhost:${port}`)
  })

  test(`should return null for transaction that doesn't exist`, async () => {
    const response = await web3.eth.getTransaction("0x926204a90109b89049965c3f31e862f0b0d1eb84103464d4d9f36fa9f037fee7")

    expect(response).toBeNull()
  })
})
