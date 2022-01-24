/* This is free and unencumbered software released into the public domain. */

import { sha256 } from 'ethereum-cryptography/sha256.js';
import * as ethers from 'ethers';
import { keccak256 } from 'ethereumjs-util';
import * as rlp from 'rlp';

export type EmptyBlock = {
  chain: number;
  id: number;
  hash: Buffer;
  nearHash: Buffer | null;
  timestamp: string | null;
  size: number;
  gasLimit: number;
  gasUsed: number;
  parentHash: Buffer;
  transactionsRoot: Buffer;
  stateRoot: Buffer;
  receiptsRoot: Buffer;
};

export function computeBlockHash(
  blockHeight: number,
  accountId: string,
  chainId: number
): Buffer {
  return sha256(generateBlockPreImage(blockHeight, accountId, chainId));
}

function generateBlockPreImage(
  blockHeight: number,
  accountId: string,
  chainId: number
): Buffer {
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

export function generateEmptyBlock(
  blockHeight: number,
  accountId: string,
  chainId: number
): EmptyBlock {
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

export function emptyTransactionsRoot(): Buffer {
  return keccak256(rlp.encode(''));
}

export function parseEVMRevertReason(reason: Uint8Array): string | Uint8Array {
  if (reason.length > 0) {
    // only for valid decoded revert reason
    const coder = new ethers.utils.AbiCoder();
    try {
      return coder.decode(['string'], reason.slice(4)).toString();
    } catch {
      return reason;
    }
  }
  return reason;
}
