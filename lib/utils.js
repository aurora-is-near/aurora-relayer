/* This is free and unencumbered software released into the public domain. */
import * as ethers from 'ethers';
import { keccak256 } from 'ethereumjs-util';
import * as rlp from 'rlp';
export function emptyTransactionsRoot() {
    return keccak256(rlp.encode(''));
}
export function parseEVMRevertReason(reason) {
    if (reason.length > 0) {
        // only for valid decoded revert reason
        const coder = new ethers.utils.AbiCoder();
        try {
            return coder.decode(['string'], reason.slice(4)).toString();
        }
        catch {
            return reason;
        }
    }
    return reason;
}
export function blockRangeFilter(filter) {
    const filterKeys = Object.keys(filter);
    const notBlockRangeProperties = ['blockHash', 'topics', 'address'];
    if (filterKeys.length === 0) {
        return false;
    }
    return !filterKeys.some((key) => notBlockRangeProperties.includes(key));
}
export function checkReceipt(receipt) {
    const auroraAddress = '0x4444588443c3a91288c5002483449aba1054192b';
    if (receipt?.from === auroraAddress) {
        receipt.contractAddress = null;
    }
    return receipt;
}
