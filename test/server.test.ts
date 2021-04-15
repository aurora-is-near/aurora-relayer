import request from 'supertest';
import nearProvider from 'near-web3-provider';
import { signTypedData_v4 } from 'eth-sig-util';

import { createApp } from '../lib/app.js';
import { createMetaCall } from './utils';

const provider = new nearProvider.NearProvider({
    nodeUrl: 'http://localhost:3030',
    networkId: 'local',
    evmAccountId: 'evm',
    masterAccountId: 'test.near',
    keyPath: '~/.near/local/validator_key.json',
});

describe("AppServer", () => {
    const privKeyHex = 'fa5411587e855bb1e8273bc728f4fc1a092e2dd61ddf788a31b98d78cca95028';
    const privKey = Buffer.from(privKeyHex, 'hex');

    const app = createApp({}, provider);

    test('#viewBalance', done => {
        request(app)
            .post("/")
            .send({ jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: ['0x702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d6'] })
            .then((response: any) => {
                expect(response.body.result).toEqual(`0x${'00'.repeat(32)}`);
                done();
            });
    });

    test('#relayMetaCall', done => {
        const typedData = createMetaCall(
            'evm', '0x0', '0x6', '0x0', '0x702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d6', '0x0', 'adopt(uint256)',
            { petId: "0x9" },
            { Arguments: [{ name: "petId", type: "uint256" }] });
        const signature = signTypedData_v4(privKey, { data: typedData });            
        request(app)
            .post("/relay")
            .send({ data: typedData, signature })
            .then((response: any) => {
                expect(response.body.error.message).toEqual('{"index":0,"kind":{"EvmError":"ContractNotFound"}}');
                expect(response.statusCode).toBe(200);
                done();
            });
    });
});
