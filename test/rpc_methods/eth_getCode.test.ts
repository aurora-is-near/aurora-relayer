/* This is free and unencumbered software released into the public domain. */

import { createServer } from '../helpers';
import Web3 from 'web3';

let web3: any;

describe('eth_getCode', () => {
  beforeAll(async () => {
    const app = await createServer();
    const port = app.address().port;
    web3 = new Web3(`http://localhost:${port}`)
  })

  test('should return code of existed contract', async () => {
    const response = await web3.eth.getCode("0x02b93db565c9e2da73e9be058c4e303bbe414d9d")

    expect(response).toContain('0x')
    expect(response.length).toBe(240)
  })

  test(`should return 0 for contract that doesn't exist`, async () => {
    const response = await web3.eth.getCode("0x02b93db565c9e2da73e9be058c4e303bbe414d9c")

    expect(response).toBe("0x")
  })
})
