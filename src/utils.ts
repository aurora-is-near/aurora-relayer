import { sha256 } from 'ethereum-cryptography/sha256.js';

export function computeBlockHash(
  blockHeight: number,
  accountId: string,
  chainId: number
): any {
  return sha256(
    generateBlockPreImage(blockHeight, accountId, chainId)
  ).toString('hex');
}

function generateBlockPreImage(
  blockHeight: number,
  accountId: string,
  chainId: number
): any {
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
