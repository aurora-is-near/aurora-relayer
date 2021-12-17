/* This is free and unencumbered software released into the public domain. */
import { sha256 } from 'ethereum-cryptography/sha256.js';
import * as ethers from 'ethers';
export function computeBlockHash(blockHeight, accountId, chainId) {
    return sha256(generateBlockPreImage(blockHeight, accountId, chainId));
}
function generateBlockPreImage(blockHeight, accountId, chainId) {
    const blockHeightBuf = Buffer.alloc(4);
    blockHeightBuf.writeInt32BE(blockHeight, 0);
    const chainIdBuf = Buffer.alloc(4);
    chainIdBuf.writeInt32BE(chainId, 0);
    return Buffer.concat([
        Buffer.alloc(29),
        chainIdBuf,
        Buffer.from(accountId, 'utf8'),
        Buffer.alloc(4),
        blockHeightBuf,
    ]);
}
export function generateEmptyBlock(blockHeight, accountId, chainId) {
    const hash = computeBlockHash(blockHeight, accountId, chainId);
    const parentHash = computeBlockHash(blockHeight - 1, accountId, chainId);
    return {
        chain: chainId,
        id: blockHeight,
        hash: hash,
        nearHash: null,
        timestamp: null,
        size: 0,
        gasLimit: 0,
        gasUsed: 0,
        parentHash: parentHash,
        transactionsRoot: Buffer.alloc(32),
        stateRoot: Buffer.alloc(32),
        receiptsRoot: Buffer.alloc(32),
    };
}
export function parseEVMRevertReason(reason) {
    if (reason.length > 0) {
        // only for valid decoded revert reason
        const coder = new ethers.utils.AbiCoder();
        const result = coder.decode(['string'], reason.slice(4));
        return result.toString();
    }
    return reason;
}
