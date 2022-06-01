/* This is free and unencumbered software released into the public domain. */

import { createServer } from '../helpers';
import Web3 from 'web3';

let web3: any;

describe('net_peerCount', () => {
  beforeAll(async () => {
    const app = await createServer();
    const port = app.address().port;
    web3 = new Web3(`http://localhost:${port}`)
  })

  test('should return 0', async () => {
    const response = await web3.eth.net.getPeerCount()

    expect(response).toBe(0)
  })
})
