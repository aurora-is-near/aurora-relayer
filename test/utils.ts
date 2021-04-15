
/// Creates a meta call from given arguments and auxiliary types.
export function createMetaCall(evmId, nonce, feeAmount, feeAddress, contractAddress, value, contractMethod, args, extraTypes) {
    const types = {
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
            { name: 'value', type: 'uint256' },
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
            evmId, nonce, feeAmount, feeAddress, contractAddress, value, contractMethod, arguments: args
        },
    };
}
