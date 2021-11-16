/// <reference types="node" />
export declare type EmptyBlock = {
    chain: number;
    id: number;
    hash: Buffer;
    nearHash: Buffer;
    timestamp: string;
    size: number;
    gasLimit: number;
    gasUsed: number;
    parentHash: Buffer;
    transactionsRoot: Buffer;
    stateRoot: Buffer;
    receiptsRoot: Buffer;
};
export declare function computeBlockHash(blockHeight: number, accountId: string, chainId: number): Buffer;
export declare function generateEmptyBlock(blockHeight: number, accountId: string, chainId: number, timestamp: number): EmptyBlock;
