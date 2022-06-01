/* This is free and unencumbered software released into the public domain. */

import { createServer } from '../helpers';
import Web3 from 'web3';

let web3: any;

describe('eth_getTransactionByBlockHashAndIndex', () => {
  beforeAll(async () => {
    const app = await createServer();
    const port = app.address().port;
    web3 = new Web3(`http://localhost:${port}`)
  })

  test(`should return null for block that doesn't exist`, async () => {
    const response = await web3.eth.getTransactionFromBlock('0x010b3538f64be7467b479f71ca96279817e33656f752b43ff256901b22596295', '0x1')

    expect(response).toBeNull()
  })
})
