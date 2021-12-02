/* This is free and unencumbered software released into the public domain. */
import { computeBlockHash } from '../../lib/utils';
import { bytesToHex } from '@aurora-is-near/engine';

describe('compute block hash', () => {
  test('should produce the same blockhash', () => {
    const expectedHash =
      '0x2dd86f99fbc7bcf80f08f0d8431875de9b4a1f98e7371edb61c7464cf9dc7498';
    const chainId = 1313161555;
    const blockHeight = 66881589;
    const accountId = 'aurora';

    expect(
      bytesToHex(computeBlockHash(blockHeight, accountId, chainId))
    ).toEqual(expectedHash);
  });
});
