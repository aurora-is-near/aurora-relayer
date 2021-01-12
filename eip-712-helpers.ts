import { recoverTypedSignature_v4 } from 'eth-sig-util';
import * as rlp from 'rlp';
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

/// Takes the EIP-712 message and prepares NEAR's EVM meta_call byte buffer.
/// See format: https://github.com/near/nearcore/blob/master/runtime/near-evm-runner/src/meta_parsing.rs#L502
/// TODO: this module should be moved into near-web3-provider.
export function encodeMetaCall(data, signature): Buffer {
    signature = Buffer.from(utils.remove0x(signature), 'hex');
    const args = listEncodeArguments(data.message.arguments, 'Arguments', data.types);
    const methodName = formMethodName('Arguments', data.message.contractMethod.slice(0, data.message.contractMethod.indexOf('(')), data.types);
    let result = Buffer.concat([
        signature,
        utils.deserializeHex(data.message.nonce, 32),
        utils.deserializeHex(data.message.feeAmount, 32),
        utils.deserializeHex(data.message.feeAddress, 20),
        utils.deserializeHex(data.message.contractAddress, 20),
        Buffer.from([methodName.length]),
        Buffer.from(methodName),
        rlp.encode(args),
    ]);
    return utils.include0x(result.toString('hex'));
}