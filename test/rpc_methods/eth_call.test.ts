/* This is free and unencumbered software released into the public domain. */

import Web3 from 'web3';

let web3: any;

describe('eth_call', () => {
  beforeAll(async () => {
    const port = process.env['EXPRESS_PORT'];
    web3 = new Web3(`http://localhost:${port}`);
  });

  test('should call method from contract', async () => {
    const contractABI = [
      {
        inputs: [],
        name: 'check',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'pure',
        type: 'function',
      },
    ];
    const contractAddress = '0x022F4C17628A68E0a5C39D8155216ba95Fa9e08a';
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    const response = await contract.methods.check().call();

    expect(response).toBe('5');
  });

  test('should call revert method from contract', async () => {
    const contractABI = [
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'x',
            type: 'uint256',
          },
        ],
        name: 'data',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];
    const contractAddress = '0xaF8bF14eA1dB408bfF5e9bcA18A0Af9cA906de29';

    const contract = new web3.eth.Contract(contractABI, contractAddress);

    const response = await contract.methods.data(5).call();

    expect(response).toMatchInlineSnapshot(`Result {}`);
  });

  test('OutOfGas', async () => {
    const response = await web3.eth.call({
      from: '0xFb9D99A9B3EC3b07933637960A05133bDEBD430c',
      to: '0xFb9D99A9B3EC3b07933637960A05133bDEBD430c',
      value: '0x1',
      gas: '0x1',
    });

    expect(response).toBe('0x');
  });

  test('OutOfFund', async () => {
    await expect(async () => {
      return await web3.eth.call({
        from: '0xFb9D99A9B3EC3b07933637960A05133bDEBD430c',
        to: '0xFb9D99A9B3EC3b07933637960A05133bDEBD430c',
        value: '0x56bc75e2d63100000',
      });
    }).rejects.toThrow('Returned error: Out Of Fund');
  });

  test('StackOverflow', async () => {
    let result: any = null;

    const contractABI = [
      {
        inputs: [],
        name: 'callToDeep',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];
    const contractAddress = '0xB42A5f475216E4508ba22dFe21a0669c40BE2936';
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    try {
      await contract.methods.callToDeep().call();
    } catch (err) {
      result = err;
    } finally {
      expect(result.message).toContain(
        'Returned error: ERR_STACK_OVERFLOW'
      );
    }
  });

  test('OutOfOffset', async () => {
    let result: any = null;

    const contractABI = [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
        ],
        name: 'test',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];
    const contractAddress = '0x4d0FcE38D795155b1A72e55423d3696d4aDff53b';
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    try {
      await contract.methods
        .test('0xF53cC0eF22a093436BB53478b6B3FA8922264a70')
        .call();
    } catch (err) {
      result = err;
    } finally {
      expect(result.message).toContain('Returned error: Out Of Offset');
    }
  });

  test('CallTooDeep', async () => {
    let result: any = null;

    const contractABI = [
      {
        "inputs": [],
        "name": "test",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
    const contractAddress = '0x73655f6d514b05ef1BEc27CfaCA01af5DA6B4388'
    const contract = new web3.eth.Contract(contractABI, contractAddress)

    try {
      result = await contract.methods
        .test()
        .call();
    } catch (err) {
      result = err;
    } finally {
      expect(result).toMatchInlineSnapshot(`Result {}`);
    }
  });
});
