import { signTypedData_v4 } from 'eth-sig-util';
import * as sigUtil from 'eth-sig-util';
import { validateEIP712, encodeMetaCall } from '../eip-712-helpers';

/// Creates a meta call from given arguments and auxiliary types.
function createMetaCall(evmId, nonce, feeAmount, feeAddress, contractAddress, contractMethod, args, extraTypes) {
    let types = {
        EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
        ],
        NearTx: [
            { name: 'evmId', type: 'string' },
            { name: 'nonce', type: 'uint256' },
            { name: 'feeAmount', type: 'uint256' },
            { name: 'feeAddress', type: 'address' },
            { name: 'contractAddress', type: 'address' },
            { name: 'contractMethod', type: 'string' },
            { name: 'arguments', type: 'Arguments' },
        ],
    };
    Object.assign(types, extraTypes);
    return {
        types,
        domain: {
            name: 'NEAR',
            version: '1',
            chainId: 1313161555,
        },
        primaryType: 'NearTx' as const,
        message: {
            evmId, nonce, feeAmount, feeAddress, contractAddress, contractMethod, arguments: args
        },
    };
}

describe('eip712', () => {
    const privKeyHex = 'fa5411587e855bb1e8273bc728f4fc1a092e2dd61ddf788a31b98d78cca95028';
    const privKey = Buffer.from(privKeyHex, 'hex');

    describe('#validateEIP712', () => {
        test('valid message', () => {
            const typedData = createMetaCall('evm', '0x0', '0x0', '0x0', '0x0', 'test()', {}, { Arguments: [] });
            const signature = signTypedData_v4(privKey, { data: typedData });
            expect(validateEIP712(typedData, signature)).toBeTruthy();
        });
    });

    describe('#encodeMetaCall', () => {
        test('encode simple function call', () => {
            const typedData = createMetaCall(
                'evm', '0xe', '0x6', '0x0', '0x702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d6', 'adopt(uint256)',
                { petId: "0x9" },
                { Arguments: [ { name: "petId", type: "uint256" }] });
            const signature = signTypedData_v4(privKey, { data: typedData });            
            expect(encodeMetaCall(typedData, signature)).toEqual('0x29b88cd2fab58cfd0d05eacdabaab081257d62bdafe9153922025c8e8723352d61922acbb290bd1dba8f17f174d47cd5cc41480d19a82a0bff4d0b9b9441399b1c000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d61461646f70742875696e7432353620706574496429c109');
        });

        test('encode struct in struct', () => {
            const typedData = createMetaCall(
                'evm', '0xe', '0x6', '0x0', '0x702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d6', 'adopt(uint256,PetObj)',
                { petId: "0x9", petObject: { petName: 'CapsLock', owner: '0x0123456789012345678901234567890123456789' } },
                { Arguments: [{ name: "petId", type: "uint256" }, { name: "petObject", type: "PetObj" }], PetObj: [{ name: "petName", type: "string"}, { name: "owner", type: "address"}] });
            const signature = signTypedData_v4(privKey, { data: typedData });
            expect(encodeMetaCall(typedData, signature)).toEqual('0xf4852afcf9b11e0c6bac70f0c468ed29fa5b2f1d5a786fc9b383729f591d4dd32a4e5bdec0e12881b9f469e14fb7eed1911613a8ea636f14df81e39568324f791b000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d64961646f70742875696e743235362070657449642c5065744f626a207065744f626a656374295065744f626a28737472696e67207065744e616d652c61646472657373206f776e657229e009de88436170734c6f636b940123456789012345678901234567890123456789');
        });
    })
});
