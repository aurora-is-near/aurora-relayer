import { recoverTypedSignature_v4 } from 'eth-sig-util';
import * as rlp from 'rlp';
import * as borsh from 'borsh';
import { utils } from 'near-web3-provider';

/// Validate that given signed Data is EIP-712 and address has enough resources to pay for transaction.
export function validateEIP712(data, signature) {
    const recoveredAddress = recoverTypedSignature_v4({ data, sig: signature });
    // console.log(`>> ${recoveredAddress}`);
    if (!recoveredAddress) return false;
    // TODO: validate address and nonce on the account.
    // TODO: validate nonce of the message.
    return true;
}

function listEncodeArguments(args, typeName, types) {
    let result = new Array();
    for (let i = 0; i < types[typeName].length; ++i) {
        if (types.hasOwnProperty(types[typeName][i].type)) {
            result.push(listEncodeArguments(args[types[typeName][i].name], types[typeName][i].type, types))
        } else {
            result.push(args[types[typeName][i].name]);
        }
    }
    return result;
}

function formMethodName(typeName, callName, types) {
    return `${callName}(${types[typeName].map(x => `${x.type} ${x.name}`).join(',')})` + 
        types[typeName].map(x => { 
            if (types.hasOwnProperty(x.type)) { return formMethodName(x.type, x.type, types) }
            else { return '' }
        }).join('')
}

class Assignable {
    constructor(properties) {
        Object.keys(properties).map((key) => {
            this[key] = properties[key];
        });
    }
}

class MetaCallArgs extends Assignable { }

const BORSH_SCHEMA = new Map([
    [MetaCallArgs, {
        kind: 'struct',
        fields: [['signature', [64]], ['v', 'u8'], ['nonce', [32]], ['feeAmount', [32]], ['feeAddress', [20]], ['contractAddress', [20]], ['value', [32]], ['methodDef', 'string'], ['args', ['u8']]],
    }],
]);

/// Takes the EIP-712 message and prepares NEAR's EVM meta_call byte buffer.
/// See format: https://github.com/near/nearcore/blob/master/runtime/near-evm-runner/src/meta_parsing.rs#L502
/// TODO: this module should be moved into near-web3-provider.
export function encodeMetaCall(data, signature): Buffer {
    signature = Buffer.from(utils.remove0x(signature), 'hex');
    const args = listEncodeArguments(data.message.arguments, 'Arguments', data.types);
    const methodDef = formMethodName('Arguments', data.message.contractMethod.slice(0, data.message.contractMethod.indexOf('(')), data.types);
    const metaCallArgs = new MetaCallArgs({
        signature: signature.slice(0, 64),
        v: signature[64],
        nonce: utils.deserializeHex(data.message.nonce, 32),
        feeAmount: utils.deserializeHex(data.message.feeAmount, 32),
        feeAddress: utils.deserializeHex(data.message.feeAddress, 20),
        contractAddress: utils.deserializeHex(data.message.contractAddress, 20),
        value: utils.deserializeHex(data.message.value, 32),
        methodDef,
        args: rlp.encode(args)
    })
    return Buffer.from(borsh.serialize(BORSH_SCHEMA, metaCallArgs));
}
