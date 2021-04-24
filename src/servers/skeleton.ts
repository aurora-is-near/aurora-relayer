/* This is free and unencumbered software released into the public domain. */

import * as api from '../api.js';
import { unimplemented, unsupported } from '../errors.js';

import { keccakFromHexString } from 'ethereumjs-util';

export class SkeletonServer implements api.Service {
    // web3_*

    async web3_clientVersion(): Promise<string> {
        return 'Aurora-Relayer/0.0.0'; // TODO
    }

    async web3_sha3(input: api.Data): Promise<api.Data> {
        return `0x${Buffer.from(keccakFromHexString(input)).toString('hex')}`;
    }

    // net_*

    async net_listening(): Promise<boolean> {
        return true;
    }

    async net_peerCount(): Promise<api.Quantity> {
        return '0x0';
    }

    async net_version(): Promise<string> {
        return await this.eth_chainId();
    }

    // eth_*

    async eth_accounts(): Promise<api.Data[]> {
        unimplemented('eth_accounts');
        return [];
    }

    async eth_blockNumber(): Promise<api.Quantity> {
        unimplemented('eth_blockNumber');
        return '0x0';
    }

    async eth_call(_transaction: api.TransactionForCall, _blockNumber?: api.Quantity | api.Tag): Promise<api.Data> {
        unimplemented('eth_call');
        return '0x';
    }

    async eth_chainId(): Promise<api.Quantity> { // EIP-695
        unimplemented('eth_chainId');
        return '0x0';
    }

    async eth_coinbase(): Promise<api.Data> {
        unimplemented('eth_coinbase');
        return '0x';
    }

    async eth_compileLLL(_code: string): Promise<api.Data> {
        unsupported('eth_compileLLL');
        return '0x';
    }

    async eth_compileSerpent(_code: string): Promise<api.Data> {
        unsupported('eth_compileSerpent');
        return '0x';
    }

    async eth_compileSolidity(_code: string): Promise<api.Data> {
        unsupported('eth_compileSolidity');
        return '0x';
    }

    async eth_estimateGas(_transaction: api.TransactionForCall, _blockNumber?: api.Quantity | api.Tag): Promise<api.Quantity> {
        return '0x0';
    }

    async eth_gasPrice(): Promise<api.Quantity> {
        return '0x0';
    }

    async eth_getBalance(_address: api.Data, _blockNumber?: api.Quantity | api.Tag): Promise<api.Quantity> {
        unimplemented('eth_getBalance');
        return '0x0';
    }

    async eth_getBlockByHash(_blockHash: api.Data, _fullObject?: boolean): Promise<api.BlockResult | null> {
        unimplemented('eth_getBlockByHash');
        return null;
    }

    async eth_getBlockByNumber(_blockNumber: api.Quantity | api.Tag, _fullObject?: boolean): Promise<api.BlockResult | null> {
        unimplemented('eth_getBlockByNumber');
        return null;
    }

    async eth_getBlockTransactionCountByHash(_blockHash: api.Data): Promise<api.Quantity | null> {
        unimplemented('eth_getBlockTransactionCountByHash');
        return null;
    }

    async eth_getBlockTransactionCountByNumber(_blockNumber: api.Quantity | api.Tag): Promise<api.Quantity | null> {
        unimplemented('eth_getBlockTransactionCountByNumber');
        return null;
    }

    async eth_getCode(_address: api.Data, _blockNumber: api.Quantity | api.Tag): Promise<api.Data> {
        unimplemented('eth_getCode');
        return '0x';
    }

    async eth_getCompilers(): Promise<string[]> {
        return [];
    }

    async eth_getFilterChanges(_filterID: api.Quantity): Promise<api.LogObject[]> {
        unimplemented('eth_getFilterChanges');
        return [];
    }

    async eth_getFilterLogs(_filterID: api.Quantity): Promise<api.LogObject[]> {
        unimplemented('eth_getFilterLogs');
        return [];
    }

    async eth_getLogs(_filter: api.FilterOptions): Promise<api.LogObject[]> {
        unimplemented('eth_getLogs');
        return [];
    }

    async eth_getProof(_address: api.Data, _keys: api.Data[], _blockNumber: api.Quantity | api.Tag): Promise<api.ProofResult> { // EIP-1186
        unsupported('eth_getProof'); // EIP-1186 TODO?
        return {};
    }

    async eth_getStorageAt(_address: api.Data, _key: api.Quantity, _blockNumber: api.Quantity | api.Tag): Promise<api.Data> {
        unimplemented('eth_getStorageAt');
        return '0x';
    }

    async eth_getTransactionByBlockHashAndIndex(_blockHash: api.Data, _transactionIndex: api.Quantity): Promise<api.TransactionResult | null> {
        unimplemented('eth_getTransactionByBlockHashAndIndex');
        return null;
    }

    async eth_getTransactionByBlockNumberAndIndex(_blockNumber: api.Quantity | api.Tag, _transactionIndex: api.Quantity): Promise<api.TransactionResult | null> {
        unimplemented('eth_getTransactionByBlockNumberAndIndex');
        return null;
    }

    async eth_getTransactionByHash(_transactionHash: api.Data): Promise<api.TransactionResult | null> {
        unimplemented('eth_getTransactionByHash');
        return null;
    }

    async eth_getTransactionCount(_address: api.Data, _blockNumber: api.Quantity | api.Tag): Promise<api.Quantity> {
        unimplemented('eth_getTransactionCount');
        return '0x0';
    }

    async eth_getTransactionReceipt(_transactionHash: string): Promise<api.TransactionReceipt | null> {
        unimplemented('eth_getTransactionReceipt');
        return null;
    }

    async eth_getUncleByBlockHashAndIndex(_blockHash: api.Data, _uncleIndex: api.Quantity): Promise<api.BlockResult | null> {
        return null; // uncle blocks are never found
    }

    async eth_getUncleByBlockNumberAndIndex(_blockNumber: api.Quantity | api.Tag, _uncleIndex: api.Quantity): Promise<api.BlockResult | null> {
        return null; // uncle blocks are never found
    }

    async eth_getUncleCountByBlockHash(_blockHash: api.Data): Promise<api.Quantity | null> {
        unimplemented('eth_getUncleCountByBlockHash');
        return null;
    }

    async eth_getUncleCountByBlockNumber(_blockNumber: api.Quantity | api.Tag): Promise<api.Quantity | null> {
        unimplemented('eth_getUncleCountByBlockNumber');
        return null;
    }

    async eth_getWork(): Promise<api.Data[]> {
        unsupported('eth_getWork');
        return [];
    }

    async eth_hashrate(): Promise<api.Quantity> {
        return '0x0';
    }

    async eth_mining(): Promise<false> {
        return false;
    }

    async eth_newBlockFilter(): Promise<api.Quantity> {
        unimplemented('eth_newBlockFilter');
        return '0x0';
    }

    async eth_newFilter(_filter: api.FilterOptions): Promise<api.Quantity> {
        unimplemented('eth_newFilter');
        return '0x0';
    }

    async eth_newPendingTransactionFilter(): Promise<api.Quantity> {
        return '0x0'; // designates the empty filter
    }

    async eth_pendingTransactions(): Promise<Record<string, string | number | null>[]> { // undocumented
        return [];
    }

    async eth_protocolVersion(): Promise<string> {
        return '0x41';
    }

    async eth_sendRawTransaction(_transaction: api.Data): Promise<api.Data> {
        unimplemented('eth_sendRawTransaction');
        return '0x';
    }

    async eth_sendTransaction(_transaction: api.TransactionForSend): Promise<api.Data> {
        unimplemented('eth_sendTransaction');
        return '0x';
    }

    async eth_sign(_account: api.Data, _message: api.Data): Promise<api.Data> {
        unimplemented('eth_sign');
        return `0x`;
    }

    async eth_signTransaction(_transaction: api.TransactionForSend): Promise<api.Data> {
        unimplemented('eth_signTransaction');
        return `0x`;
    }

    async eth_signTypedData(_address: api.Data, _data: api.TypedData): Promise<api.Data> { // EIP-712
        unimplemented('eth_signTypedData');
        return `0x`;
    }

    async eth_submitHashrate(_hashrate: api.Quantity, _clientID: api.Quantity): Promise<false> {
        unsupported('eth_submitHashrate');
        return false;
    }

    async eth_submitWork(_nonce: api.Data, _powHash: api.Data, _mixDigest: api.Data): Promise<false> {
        unsupported('eth_submitWork');
        return false;
    }

    async eth_syncing(): Promise<false> {
        return false;
    }

    async eth_uninstallFilter(_filterID: api.Quantity): Promise<boolean> {
        unimplemented('eth_uninstallFilter');
        return false;
    }
}
