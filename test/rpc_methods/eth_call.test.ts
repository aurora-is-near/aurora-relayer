/* This is free and unencumbered software released into the public domain. */

import { createServer } from '../helpers';
import Web3 from 'web3';

let web3: any;

describe('eth_call', () => {
  beforeAll(async () => {
    const app = await createServer();
    const port = app.address().port;
    web3 = new Web3(`http://localhost:${port}`)
  })

  test('should call method from contract', async () => {
    const contractABI = [
      {
        "inputs": [],
        "name": "check",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      }
    ];
    const contractAddress = '0x022F4C17628A68E0a5C39D8155216ba95Fa9e08a'
    const contract = new web3.eth.Contract(contractABI, contractAddress)
    const response = await contract.methods.check().call()

    expect(response).toBe("5");
  })
})
