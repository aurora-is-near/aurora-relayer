/* This is free and unencumbered software released into the public domain. */
import { sha256 } from 'ethereum-cryptography/sha256.js';
import { keccak256 } from 'ethereumjs-util';
import * as rlp from 'rlp';
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
        transactionsRoot: emptyTransactionsRoot(),
        stateRoot: Buffer.alloc(32),
        receiptsRoot: Buffer.alloc(32),
    };
}
export function emptyTransactionsRoot() {
    return keccak256(rlp.encode(''));
}
