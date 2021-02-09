import { signTypedData_v4 } from 'eth-sig-util';
import { validateEIP712, encodeMetaCall } from '../eip-712-helpers';
import { createMetaCall } from './utils';

describe('eip712', () => {
    const privKeyHex = 'fa5411587e855bb1e8273bc728f4fc1a092e2dd61ddf788a31b98d78cca95028';
    const privKey = Buffer.from(privKeyHex, 'hex');

    describe('#validateEIP712', () => {
        test('valid message', () => {
            const typedData = createMetaCall('evm', '0x0', '0x0', '0x0', '0x0', '0x0', 'test()', {}, { Arguments: [] });
            const signature = signTypedData_v4(privKey, { data: typedData });
            expect(validateEIP712(typedData, signature)).toBeTruthy();
        });
    });

    describe('#encodeMetaCall', () => {
        test('encode simple function call', () => {
            const typedData = createMetaCall(
                'evm', '0xe', '0x6', '0x0', '0x702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d6', '0x0', 'adopt(uint256)',
                { petId: "0x9" },
                { Arguments: [ { name: "petId", type: "uint256" }] });
            const signature = signTypedData_v4(privKey, { data: typedData });            
            expect(encodeMetaCall(typedData, signature).toString('hex')).toEqual('4d94263f09bfd6322a633eebbf087fbed32d1b964e2fdab9cc9931fff3b9cd683e0912697e26836007e6ba026acccd9bb6116713959936815b1f6d9496dc5d341c000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d600000000000000000000000000000000000000000000000000000000000000001400000061646f70742875696e743235362070657449642902000000c109');
        });

        test('encode struct in struct', () => {
            const typedData = createMetaCall(
                'evm', '0xe', '0x6', '0x0', '0x702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d6', '0x0', 'adopt(uint256,PetObj)',
                { petId: "0x9", petObject: { petName: 'CapsLock', owner: '0x0123456789012345678901234567890123456789' } },
                { Arguments: [{ name: "petId", type: "uint256" }, { name: "petObject", type: "PetObj" }], PetObj: [{ name: "petName", type: "string"}, { name: "owner", type: "address"}] });
            const signature = signTypedData_v4(privKey, { data: typedData });
            expect(encodeMetaCall(typedData, signature).toString('hex')).toEqual('9efee70f160fed244ef03ccfab3ebb1f24be4f41052a7b83d99d3bd9250fcf3a612c448133170b4968c73ec56cba65c6cae50a39aec922ed605aa04c0ddff8e11c000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d600000000000000000000000000000000000000000000000000000000000000004900000061646f70742875696e743235362070657449642c5065744f626a207065744f626a656374295065744f626a28737472696e67207065744e616d652c61646472657373206f776e65722921000000e009de88436170734c6f636b940123456789012345678901234567890123456789');
        });
    })
});
