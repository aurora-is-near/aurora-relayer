/* This is free and unencumbered software released into the public domain. */
import { unimplemented, unsupported } from '../errors.js';
import { bytesToHex, intToHex } from '@aurora-is-near/engine';
import { keccakFromHexString } from 'ethereumjs-util';
export class SkeletonServer {
    constructor(config, logger, engine, provider) {
        this.config = config;
        this.logger = logger;
        this.engine = engine;
        this.provider = provider;
        this._init();
    }
    // web3_*
    async web3_clientVersion() {
        return 'Aurora-Relayer/0.0.0'; // TODO
    }
    async web3_sha3(input) {
        return bytesToHex(keccakFromHexString(input));
    }
    // net_*
    async net_listening() {
        return true;
    }
    async net_peerCount() {
        return intToHex(0);
    }
    async net_version() {
        return await this.eth_chainId();
    }
    // eth_*
    async eth_accounts() {
        return []; // no private keys under management here
    }
    async eth_blockNumber() {
        unimplemented('eth_blockNumber');
        return intToHex(0);
    }
    async eth_call(_transaction, _blockNumber) {
        unimplemented('eth_call');
        return '0x';
    }
    async eth_chainId() {
        unimplemented('eth_chainId');
        return intToHex(0);
    }
    async eth_coinbase() {
        unimplemented('eth_coinbase');
        return '0x';
    }
    async eth_compileLLL(_code) {
        unsupported('eth_compileLLL');
        return '0x';
    }
    async eth_compileSerpent(_code) {
        unsupported('eth_compileSerpent');
        return '0x';
    }
    async eth_compileSolidity(_code) {
        unsupported('eth_compileSolidity');
        return '0x';
    }
    async eth_estimateGas(_transaction, _blockNumber) {
        return intToHex(0);
    }
    async eth_gasPrice() {
        return intToHex(0);
    }
    async eth_getBalance(_address, _blockNumber) {
        unimplemented('eth_getBalance');
        return intToHex(0);
    }
    async eth_getBlockByHash(_blockHash, _fullObject) {
        unimplemented('eth_getBlockByHash');
        return null;
    }
    async eth_getBlockByNumber(_blockNumber, _fullObject) {
        unimplemented('eth_getBlockByNumber');
        return null;
    }
    async eth_getBlockTransactionCountByHash(_blockHash) {
        unimplemented('eth_getBlockTransactionCountByHash');
        return null;
    }
    async eth_getBlockTransactionCountByNumber(_blockNumber) {
        unimplemented('eth_getBlockTransactionCountByNumber');
        return null;
    }
    async eth_getCode(_address, _blockNumber) {
        unimplemented('eth_getCode');
        return '0x';
    }
    async eth_getCompilers() {
        return [];
    }
    async eth_getFilterChanges(_filterID) {
        unimplemented('eth_getFilterChanges');
        return [];
    }
    async eth_getFilterLogs(_filterID) {
        unimplemented('eth_getFilterLogs');
        return [];
    }
    async eth_getLogs(_filter) {
        unimplemented('eth_getLogs');
        return [];
    }
    async eth_getProof(_address, _keys, _blockNumber) {
        unsupported('eth_getProof'); // EIP-1186 TODO?
        return {};
    }
    async eth_getStorageAt(_address, _key, _blockNumber) {
        unimplemented('eth_getStorageAt');
        return '0x';
    }
    async eth_getTransactionByBlockHashAndIndex(_blockHash, _transactionIndex) {
        unimplemented('eth_getTransactionByBlockHashAndIndex');
        return null;
    }
    async eth_getTransactionByBlockNumberAndIndex(_blockNumber, _transactionIndex) {
        unimplemented('eth_getTransactionByBlockNumberAndIndex');
        return null;
    }
    async eth_getTransactionByHash(_transactionHash) {
        unimplemented('eth_getTransactionByHash');
        return null;
    }
    async eth_getTransactionCount(_address, _blockNumber) {
        unimplemented('eth_getTransactionCount');
        return intToHex(0);
    }
    async eth_getTransactionReceipt(_transactionHash) {
        unimplemented('eth_getTransactionReceipt');
        return null;
    }
    async eth_getUncleByBlockHashAndIndex(_blockHash, _uncleIndex) {
        return null; // uncle blocks are never found
    }
    async eth_getUncleByBlockNumberAndIndex(_blockNumber, _uncleIndex) {
        return null; // uncle blocks are never found
    }
    async eth_getUncleCountByBlockHash(_blockHash) {
        unimplemented('eth_getUncleCountByBlockHash');
        return null;
    }
    async eth_getUncleCountByBlockNumber(_blockNumber) {
        unimplemented('eth_getUncleCountByBlockNumber');
        return null;
    }
    async eth_getWork() {
        unsupported('eth_getWork');
        return [];
    }
    async eth_hashrate() {
        return intToHex(0);
    }
    async eth_mining() {
        return false;
    }
    async eth_newBlockFilter() {
        unimplemented('eth_newBlockFilter');
        return intToHex(0);
    }
    async eth_newFilter(_filter) {
        unimplemented('eth_newFilter');
        return intToHex(0);
    }
    async eth_newPendingTransactionFilter() {
        return intToHex(0); // designates the empty filter
    }
    async eth_pendingTransactions() {
        return [];
    }
    async eth_protocolVersion() {
        return intToHex(0x41);
    }
    async eth_sendRawTransaction(_transaction) {
        unimplemented('eth_sendRawTransaction');
        return '0x';
    }
    async eth_sendTransaction(_transaction) {
        unimplemented('eth_sendTransaction');
        return '0x';
    }
    async eth_sign(_account, _message) {
        unsupported('eth_sign'); // no private keys under management here
        return '0x';
    }
    async eth_signTransaction(_transaction) {
        unsupported('eth_signTransaction'); // no private keys under management here
        return '0x';
    }
    async eth_signTypedData(_address, _data) {
        unsupported('eth_signTypedData'); // no private keys under management here
        return '0x';
    }
    async eth_submitHashrate(_hashrate, _clientID) {
        unsupported('eth_submitHashrate');
        return false;
    }
    async eth_submitWork(_nonce, _powHash, _mixDigest) {
        unsupported('eth_submitWork');
        return false;
    }
    async eth_syncing() {
        return false;
    }
    async eth_uninstallFilter(_filterID) {
        unimplemented('eth_uninstallFilter');
        return false;
    }
}
