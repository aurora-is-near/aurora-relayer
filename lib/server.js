/* This is free and unencumbered software released into the public domain. */
import { unimplemented, unsupported } from './errors.js';
import { Address, formatU256, hexToBase58, intToHex } from '@aurora-is-near/engine';
import { keccakFromHexString } from 'ethereumjs-util';
export class Server {
    constructor(engine, provider, options) {
        this.engine = engine;
        this.provider = provider;
        this.options = options;
    }
    // web3_*
    async web3_clientVersion() {
        return 'Aurora-Relayer/0.0.0'; // TODO
    }
    async web3_sha3(input) {
        return `0x${Buffer.from(keccakFromHexString(input)).toString('hex')}`;
    }
    // net_*
    async net_listening() {
        return true;
    }
    async net_peerCount() {
        return '0x0';
    }
    async net_version() {
        const chainID = (await this.engine.getChainID()).unwrap();
        return `0x${chainID.toString(16)}`;
    }
    // eth_*
    async eth_accounts() {
        return (await this.engine.keyStore.getSigningAddresses()).map(a => a.toString());
    }
    async eth_blockNumber() {
        const height = (await this.engine.getBlockHeight()).unwrap();
        return `0x${height.toString(16)}`;
    }
    async eth_call(transaction, blockNumber) {
        return await this.provider.routeRPC('eth_call', [transaction, blockNumber]); // TODO
    }
    async eth_chainId() {
        const chainID = (await this.engine.getChainID()).unwrap();
        return `0x${chainID.toString(16)}`;
    }
    async eth_coinbase() {
        return (await this.engine.getCoinbase()).unwrap().toString();
    }
    async eth_compileLLL(_code) {
        unsupported('eth_compileLLL');
        return '';
    }
    async eth_compileSerpent(_code) {
        unsupported('eth_compileSerpent');
        return '';
    }
    async eth_compileSolidity(_code) {
        unsupported('eth_compileSolidity');
        return '';
    }
    async eth_estimateGas(_transaction, _blockNumber) {
        return '0x0';
    }
    async eth_gasPrice() {
        return '0x0';
    }
    async eth_getBalance(address, blockNumber) {
        const address_ = Address.parse(address).unwrap();
        const balance = (await this.engine.getBalance(address_)).unwrap();
        return `0x${balance.toString(16)}`;
    }
    async eth_getBlockByHash(blockHash, fullObject) {
        const blockHash_ = blockHash.startsWith('0x') ? hexToBase58(blockHash) : blockHash;
        const options = {
            contractID: this.engine.contractID,
            transactions: fullObject ? 'full' : 'id',
        };
        const result = await this.engine.getBlock(blockHash_, options);
        if (result.isErr())
            return null;
        const block = result.unwrap();
        const response = block.toJSON();
        if (fullObject) {
            response.transactions.forEach((tx, i) => {
                tx.blockHash = block.hash;
                tx.blockNumber = intToHex(block.number);
                tx.transactionIndex = intToHex(i);
            });
        }
        return response;
    }
    async eth_getBlockByNumber(blockNumber, fullObject) {
        const blockNumber_ = blockNumber.startsWith('0x') ? parseInt(blockNumber, 16) : blockNumber;
        const options = {
            contractID: this.engine.contractID,
            transactions: fullObject ? 'full' : 'id',
        };
        const result = await this.engine.getBlock(blockNumber_, options);
        if (result.isErr())
            return null;
        const block = result.unwrap();
        const response = block.toJSON();
        if (fullObject) {
            response.transactions.forEach((tx, i) => {
                tx.blockHash = block.hash;
                tx.blockNumber = intToHex(block.number);
                tx.transactionIndex = intToHex(i);
            });
        }
        return response;
    }
    async eth_getBlockTransactionCountByHash(blockHash) {
        const blockHash_ = blockHash.startsWith('0x') ? hexToBase58(blockHash) : blockHash;
        const result = await this.engine.getBlockTransactionCount(blockHash_);
        if (result.isErr())
            return null;
        return `0x${result.unwrap().toString(16)}`;
    }
    async eth_getBlockTransactionCountByNumber(blockNumber) {
        const blockNumber_ = blockNumber.startsWith('0x') ? parseInt(blockNumber, 16) : blockNumber;
        const result = await this.engine.getBlockTransactionCount(blockNumber_);
        if (result.isErr())
            return null;
        return `0x${result.unwrap().toString(16)}`;
    }
    async eth_getCode(address, _blockNumber) {
        const address_ = Address.parse(address).unwrap();
        const code = (await this.engine.getCode(address_)).unwrap();
        return `0x${Buffer.from(code).toString('hex')}`;
    }
    async eth_getCompilers() {
        return [];
    }
    async eth_getFilterChanges(_filterID) {
        unimplemented('eth_getFilterChanges'); // TODO
        return [];
    }
    async eth_getFilterLogs(_filterID) {
        unimplemented('eth_getFilterLogs'); // TODO
        return [];
    }
    async eth_getLogs(filter) {
        return await this.provider.routeRPC('eth_getLogs', [filter]); // TODO
    }
    async eth_getProof(_address, _keys, _blockNumber) {
        unsupported('eth_getProof'); // EIP-1186 TODO?
        return {};
    }
    async eth_getStorageAt(address, key, blockNumber) {
        const address_ = Address.parse(address).unwrap();
        const result = (await this.engine.getStorageAt(address_, key)).unwrap();
        return formatU256(result);
    }
    async eth_getTransactionByBlockHashAndIndex(blockHash, transactionIndex) {
        const blockHash_ = blockHash.startsWith('0x') ? hexToBase58(blockHash) : blockHash;
        const transactionIndex_ = parseInt(transactionIndex, 16);
        const options = {
            contractID: this.engine.contractID,
            transactions: 'full',
        };
        const result = await this.engine.getBlock(blockHash_, options);
        if (result.isErr())
            return null;
        const block = result.unwrap();
        let transaction = block.toJSON().transactions[transactionIndex_];
        if (transaction) {
            transaction = Object.assign(transaction, {
                blockHash: block.hash,
                blockNumber: intToHex(block.number),
                transactionIndex: intToHex(transactionIndex_),
            });
        }
        return transaction || null;
    }
    async eth_getTransactionByBlockNumberAndIndex(blockNumber, transactionIndex) {
        const blockNumber_ = blockNumber.startsWith('0x') ? parseInt(blockNumber, 16) : blockNumber;
        const transactionIndex_ = parseInt(transactionIndex, 16);
        const options = {
            contractID: this.engine.contractID,
            transactions: 'full',
        };
        const result = await this.engine.getBlock(blockNumber_, options);
        if (result.isErr())
            return null;
        const block = result.unwrap();
        let transaction = block.toJSON().transactions[transactionIndex_];
        if (transaction) {
            transaction = Object.assign(transaction, {
                blockHash: block.hash,
                blockNumber: intToHex(block.number),
                transactionIndex: intToHex(transactionIndex_),
            });
        }
        return transaction || null;
    }
    async eth_getTransactionByHash(transactionHash) {
        return await this.provider.routeRPC('eth_getTransactionByHash', [transactionHash]); // TODO
    }
    async eth_getTransactionCount(address, _blockNumber) {
        //const [address] = expectArgs(params, 1, 2, "cannot request transaction count without specifying address");
        const address_ = Address.parse(address).unwrap();
        const nonce = (await this.engine.getNonce(address_)).unwrap();
        return `0x${nonce.toString(16)}`;
    }
    async eth_getTransactionReceipt(transactionHash) {
        return await this.provider.routeRPC('eth_getTransactionReceipt', [transactionHash]); // TODO
    }
    async eth_getUncleByBlockHashAndIndex(_blockHash, _uncleIndex) {
        return null; // uncle blocks are never found
    }
    async eth_getUncleByBlockNumberAndIndex(_blockNumber, _uncleIndex) {
        return null; // uncle blocks are never found
    }
    async eth_getUncleCountByBlockHash(blockHash) {
        const blockHash_ = blockHash.startsWith('0x') ? hexToBase58(blockHash) : blockHash;
        const result = await this.engine.hasBlock(blockHash_);
        return result && result.isOk() ? '0x0' : null;
    }
    async eth_getUncleCountByBlockNumber(blockNumber) {
        const blockNumber_ = blockNumber.startsWith('0x') ? parseInt(blockNumber, 16) : blockNumber;
        const result = await this.engine.hasBlock(blockNumber_);
        return result && result.isOk() ? '0x0' : null;
    }
    async eth_getWork() {
        unsupported('eth_getWork');
        return [];
    }
    async eth_hashrate() {
        return '0x0';
    }
    async eth_mining() {
        return false;
    }
    async eth_newBlockFilter() {
        unimplemented('eth_newBlockFilter'); // TODO
        return `0x0`;
    }
    async eth_newFilter(_filter) {
        unimplemented('eth_newFilter'); // TODO
        return `0x0`;
    }
    async eth_newPendingTransactionFilter() {
        unimplemented('eth_newPendingTransactionFilter'); // TODO
        return `0x0`;
    }
    async eth_pendingTransactions() {
        return [];
    }
    async eth_protocolVersion() {
        return '0x41';
    }
    async eth_sendRawTransaction(transaction) {
        const output = (await this.engine.rawCall(transaction)).unwrap();
        return `0x${output ? Buffer.from(output).toString('hex') : ''}`;
    }
    async eth_sendTransaction(transaction) {
        return await this.provider.routeRPC('eth_sendTransaction', [transaction]); // TODO
    }
    async eth_sign(_account, _message) {
        unimplemented('eth_sign'); // TODO
        return `0x`;
    }
    async eth_signTransaction(_transaction) {
        unimplemented('eth_signTransaction'); // TODO
        return `0x`;
    }
    async eth_signTypedData(_address, _data) {
        unimplemented('eth_signTypedData'); // TODO
        return `0x`;
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
        unimplemented('eth_uninstallFilter'); // TODO
        return false;
    }
}
