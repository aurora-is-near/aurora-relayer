/// <reference types="node" />
import * as web3 from './web3.js';
export declare function emptyTransactionsRoot(): Buffer;
export declare function parseEVMRevertReason(reason: Uint8Array): string | Uint8Array;
export declare function blockRangeFilter(filter: web3.FilterOptions): boolean;
export declare function checkReceipt(receipt: any): web3.TransactionReceipt | null;
