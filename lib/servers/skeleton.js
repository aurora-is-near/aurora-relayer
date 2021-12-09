/* This is free and unencumbered software released into the public domain. */
import { unimplemented, unsupported } from '../errors.js';
import { bytesToHex, intToHex } from '@aurora-is-near/engine';
import { keccakFromHexString } from 'ethereumjs-util';
import { spawn } from 'child_process';
export class SkeletonServer {
    constructor(config, logger, engine) {
        this.config = config;
        this.logger = logger;
        this.engine = engine;
        this._init();
    }
    _isBannedEOA(address) {
        const key = address.toString().toLowerCase();
        return this.config.blacklistEOAs.has(key);
    }
    _isBannedCA(address) {
        const key = address.toString().toLowerCase();
        return this.config.blacklistCAs.has(key);
    }
    _enforceBans(address, method) {
        this._enforceEOABan(address, method);
        this._enforceCABan(address, method);
    }
    _enforceEOABan(address, method) {
        if (this._isBannedEOA(address)) {
            unsupported(method);
        }
    }
    _enforceCABan(address, method) {
        if (this._isBannedCA(address)) {
            unsupported(method);
        }
    }
    _scanForCABans(bytes) {
        for (const [address, _] of this.config.blacklistCAs.entries()) {
            const match = address.substring(2); // strip '0x' prefix
            if (bytes.includes(match)) {
                return address;
            }
        }
        return null;
    }
    async _banIP(ip, reason) {
        if (!ip)
            return;
        this.config.blacklistIPs.add(ip);
        if (process.env.CF_API_TOKEN &&
            process.env.CF_ACCOUNT_ID &&
            process.env.CF_LIST_ID) {
            const subprocess = spawn('/srv/aurora/relayer/util/ban/ban', // FIXME: don't use absolute path
            [ip, reason || ''], {
                shell: false,
                detached: true,
                stdio: 'ignore',
                timeout: 60 * 1000,
                env: process.env,
            });
            subprocess.unref();
        }
    }
    // web3_*
    async web3_clientVersion(_request) {
        return 'Aurora-Relayer/0.0.0'; // TODO
    }
    async web3_sha3(_request, input) {
        return bytesToHex(keccakFromHexString(input));
    }
    // net_*
    async net_listening(_request) {
        return true;
    }
    async net_peerCount(_request) {
        return intToHex(0);
    }
    async net_version(_request) {
        const netVersion = (await this.engine.getChainID()).unwrap();
        return netVersion.toString();
    }
    // eth_*
    async eth_accounts(_request) {
        return []; // no private keys under management here
    }
    async eth_blockNumber(_request) {
        unimplemented('eth_blockNumber');
        return intToHex(0);
    }
    async eth_call(_request, _transaction, _blockNumber) {
        unimplemented('eth_call');
        return '0x';
    }
    async eth_chainId(_request) {
        // EIP-695
        unimplemented('eth_chainId');
        return intToHex(0);
    }
    async eth_coinbase(_request) {
        unimplemented('eth_coinbase');
        return '0x';
    }
    async eth_compileLLL(_request, _code) {
        unsupported('eth_compileLLL');
        return '0x';
    }
    async eth_compileSerpent(_request, _code) {
        unsupported('eth_compileSerpent');
        return '0x';
    }
    async eth_compileSolidity(_request, _code) {
        unsupported('eth_compileSolidity');
        return '0x';
    }
    async eth_estimateGas(_request, _transaction, _blockNumber) {
        // See: https://www.trufflesuite.com/docs/truffle/reference/configuration
        return intToHex(6721975); // 0x6691b7
    }
    async eth_gasPrice(_request) {
        return intToHex(0);
    }
    async eth_getBalance(_request, _address, _blockNumber) {
        unimplemented('eth_getBalance');
        return intToHex(0);
    }
    async eth_getBlockByHash(_request, _blockHash, _fullObject) {
        unimplemented('eth_getBlockByHash');
        return null;
    }
    async eth_getBlockByNumber(_request, _blockNumber, _fullObject) {
        unimplemented('eth_getBlockByNumber');
        return null;
    }
    async eth_getBlockTransactionCountByHash(_request, _blockHash) {
        unimplemented('eth_getBlockTransactionCountByHash');
        return null;
    }
    async eth_getBlockTransactionCountByNumber(_request, _blockNumber) {
        unimplemented('eth_getBlockTransactionCountByNumber');
        return null;
    }
    async eth_getCode(_request, _address, _blockNumber) {
        unimplemented('eth_getCode');
        return '0x';
    }
    async eth_getCompilers(_request) {
        return [];
    }
    async eth_getFilterChanges(_request, _filterID) {
        unimplemented('eth_getFilterChanges');
        return [];
    }
    async eth_getFilterLogs(_request, _filterID) {
        unimplemented('eth_getFilterLogs');
        return [];
    }
    async eth_getLogs(_request, _filter) {
        unimplemented('eth_getLogs');
        return [];
    }
    async eth_getProof(_request, _address, _keys, _blockNumber) {
        // EIP-1186
        unsupported('eth_getProof'); // EIP-1186 TODO?
        return {};
    }
    async eth_getStorageAt(_request, _address, _key, _blockNumber) {
        unimplemented('eth_getStorageAt');
        return '0x';
    }
    async eth_getTransactionByBlockHashAndIndex(_request, _blockHash, _transactionIndex) {
        unimplemented('eth_getTransactionByBlockHashAndIndex');
        return null;
    }
    async eth_getTransactionByBlockNumberAndIndex(_request, _blockNumber, _transactionIndex) {
        unimplemented('eth_getTransactionByBlockNumberAndIndex');
        return null;
    }
    async eth_getTransactionByHash(_request, _transactionHash) {
        unimplemented('eth_getTransactionByHash');
        return null;
    }
    async eth_getTransactionCount(_request, _address, _blockNumber) {
        unimplemented('eth_getTransactionCount');
        return intToHex(0);
    }
    async eth_getTransactionReceipt(_request, _transactionHash) {
        unimplemented('eth_getTransactionReceipt');
        return null;
    }
    async eth_getTransactionReceiptsByBlockNumber(_request, _blockNumber) {
        unimplemented('eth_getTransactionReceiptsByBlockNumber');
        return null;
    }
    async eth_getTransactionsByBlockNumber(_request, _blockNumber) {
        unimplemented('eth_getTransactionsByBlockNumber');
        return null;
    }
    async eth_getUncleByBlockHashAndIndex(_request, _blockHash, _uncleIndex) {
        return null; // uncle blocks are never found
    }
    async eth_getUncleByBlockNumberAndIndex(_request, _blockNumber, _uncleIndex) {
        return null; // uncle blocks are never found
    }
    async eth_getUncleCountByBlockHash(_request, _blockHash) {
        unimplemented('eth_getUncleCountByBlockHash');
        return null;
    }
    async eth_getUncleCountByBlockNumber(_request, _blockNumber) {
        unimplemented('eth_getUncleCountByBlockNumber');
        return null;
    }
    async eth_getWork(_request) {
        unsupported('eth_getWork');
        return [];
    }
    async eth_hashrate(_request) {
        return intToHex(0);
    }
    async eth_mining(_request) {
        return false;
    }
    async eth_newBlockFilter(_request) {
        unimplemented('eth_newBlockFilter');
        return intToHex(0);
    }
    async eth_newFilter(_request, _filter) {
        unimplemented('eth_newFilter');
        return intToHex(0);
    }
    async eth_newPendingTransactionFilter(_request) {
        return intToHex(0); // designates the empty filter
    }
    async eth_pendingTransactions(_request) {
        // undocumented
        return [];
    }
    async eth_protocolVersion(_request) {
        return intToHex(0x41);
    }
    async eth_sendRawTransaction(_request, _transaction) {
        unimplemented('eth_sendRawTransaction');
        return '0x';
    }
    async eth_sendTransaction(_request, _transaction) {
        unsupported('eth_sendTransaction');
        return '0x';
    }
    async eth_sign(_request, _account, _message) {
        unsupported('eth_sign'); // no private keys under management here
        return '0x';
    }
    async eth_signTransaction(_request, _transaction) {
        unsupported('eth_signTransaction'); // no private keys under management here
        return '0x';
    }
    async eth_signTypedData(_request, _address, _data) {
        // EIP-712
        unsupported('eth_signTypedData'); // no private keys under management here
        return '0x';
    }
    async eth_submitHashrate(_request, _hashrate, _clientID) {
        unsupported('eth_submitHashrate');
        return false;
    }
    async eth_submitWork(_request, _nonce, _powHash, _mixDigest) {
        unsupported('eth_submitWork');
        return false;
    }
    async eth_syncing(_request) {
        return false;
    }
    async eth_uninstallFilter(_request, _filterID) {
        unimplemented('eth_uninstallFilter');
        return false;
    }
    // @see {@link https://geth.ethereum.org/docs/rpc/ns-txpool#txpool_content}
    async txpool_content(_request) {
        return { pending: {}, queued: {} };
    }
    // @see {@link https://geth.ethereum.org/docs/rpc/ns-txpool#txpool_inspect}
    async txpool_inspect(_request) {
        return { pending: {}, queued: {} };
    }
    // @see {@link https://geth.ethereum.org/docs/rpc/ns-txpool#txpool_status}
    async txpool_status(_request) {
        return { pending: 0, queued: 0 };
    }
    // @see {@link https://openethereum.github.io/JSONRPC-parity-module#parity_pendingtransactions}
    async parity_pendingTransactions(_request, _limit, _filter) {
        return [];
    }
}
