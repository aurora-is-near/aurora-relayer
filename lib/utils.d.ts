/// <reference types="node" />
export declare type EmptyBlock = {
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
export declare function computeBlockHash(blockHeight: number, accountId: string, chainId: number): Buffer;
export declare function generateEmptyBlock(blockHeight: number, accountId: string, chainId: number): EmptyBlock;
export declare function emptyTransactionsRoot(): Buffer;
export declare function parseEVMRevertReason(reason: Uint8Array): string | Uint8Array;
