import * as web3 from '../web3.js';
import { Config } from '../config.js';
import { Engine } from '@aurora-is-near/engine';
import { Logger } from 'pino';
export declare abstract class SkeletonServer implements web3.Service {
    readonly config: Config;
    readonly logger: Logger;
    readonly engine: Engine;
    constructor(config: Config, logger: Logger, engine: Engine);
    protected abstract _init(): Promise<void>;
    web3_clientVersion(): Promise<string>;
    web3_sha3(input: web3.Data): Promise<web3.Data>;
    net_listening(): Promise<boolean>;
    net_peerCount(): Promise<web3.Quantity>;
    net_version(): Promise<string>;
    eth_accounts(): Promise<web3.Data[]>;
    eth_blockNumber(): Promise<web3.Quantity>;
    eth_call(_transaction: web3.TransactionForCall, _blockNumber?: web3.Quantity | web3.Tag): Promise<web3.Data>;
    eth_chainId(): Promise<web3.Quantity>;
    eth_coinbase(): Promise<web3.Data>;
    eth_compileLLL(_code: string): Promise<web3.Data>;
    eth_compileSerpent(_code: string): Promise<web3.Data>;
    eth_compileSolidity(_code: string): Promise<web3.Data>;
    eth_estimateGas(_transaction: web3.TransactionForCall, _blockNumber?: web3.Quantity | web3.Tag): Promise<web3.Quantity>;
    eth_gasPrice(): Promise<web3.Quantity>;
    eth_getBalance(_address: web3.Data, _blockNumber?: web3.Quantity | web3.Tag): Promise<web3.Quantity>;
    eth_getBlockByHash(_blockHash: web3.Data, _fullObject?: boolean): Promise<web3.BlockResult | null>;
    eth_getBlockByNumber(_blockNumber: web3.Quantity | web3.Tag, _fullObject?: boolean): Promise<web3.BlockResult | null>;
    eth_getBlockTransactionCountByHash(_blockHash: web3.Data): Promise<web3.Quantity | null>;
    eth_getBlockTransactionCountByNumber(_blockNumber: web3.Quantity | web3.Tag): Promise<web3.Quantity | null>;
    eth_getCode(_address: web3.Data, _blockNumber: web3.Quantity | web3.Tag): Promise<web3.Data>;
    eth_getCompilers(): Promise<string[]>;
    eth_getFilterChanges(_filterID: web3.Quantity): Promise<web3.LogObject[]>;
    eth_getFilterLogs(_filterID: web3.Quantity): Promise<web3.LogObject[]>;
    eth_getLogs(_filter: web3.FilterOptions): Promise<web3.LogObject[]>;
    eth_getProof(_address: web3.Data, _keys: web3.Data[], _blockNumber: web3.Quantity | web3.Tag): Promise<web3.ProofResult>;
    eth_getStorageAt(_address: web3.Data, _key: web3.Quantity, _blockNumber: web3.Quantity | web3.Tag): Promise<web3.Data>;
    eth_getTransactionByBlockHashAndIndex(_blockHash: web3.Data, _transactionIndex: web3.Quantity): Promise<web3.TransactionResult | null>;
    eth_getTransactionByBlockNumberAndIndex(_blockNumber: web3.Quantity | web3.Tag, _transactionIndex: web3.Quantity): Promise<web3.TransactionResult | null>;
    eth_getTransactionByHash(_transactionHash: web3.Data): Promise<web3.TransactionResult | null>;
    eth_getTransactionCount(_address: web3.Data, _blockNumber: web3.Quantity | web3.Tag): Promise<web3.Quantity>;
    eth_getTransactionReceipt(_transactionHash: string): Promise<web3.TransactionReceipt | null>;
    eth_getUncleByBlockHashAndIndex(_blockHash: web3.Data, _uncleIndex: web3.Quantity): Promise<web3.BlockResult | null>;
    eth_getUncleByBlockNumberAndIndex(_blockNumber: web3.Quantity | web3.Tag, _uncleIndex: web3.Quantity): Promise<web3.BlockResult | null>;
    eth_getUncleCountByBlockHash(_blockHash: web3.Data): Promise<web3.Quantity | null>;
    eth_getUncleCountByBlockNumber(_blockNumber: web3.Quantity | web3.Tag): Promise<web3.Quantity | null>;
    eth_getWork(): Promise<web3.Data[]>;
    eth_hashrate(): Promise<web3.Quantity>;
    eth_mining(): Promise<false>;
    eth_newBlockFilter(): Promise<web3.Quantity>;
    eth_newFilter(_filter: web3.FilterOptions): Promise<web3.Quantity>;
    eth_newPendingTransactionFilter(): Promise<web3.Quantity>;
    eth_pendingTransactions(): Promise<Record<string, string | number | null>[]>;
    eth_protocolVersion(): Promise<string>;
    eth_sendRawTransaction(_transaction: web3.Data): Promise<web3.Data>;
    eth_sendTransaction(_transaction: web3.TransactionForSend): Promise<web3.Data>;
    eth_sign(_account: web3.Data, _message: web3.Data): Promise<web3.Data>;
    eth_signTransaction(_transaction: web3.TransactionForSend): Promise<web3.Data>;
    eth_signTypedData(_address: web3.Data, _data: web3.TypedData): Promise<web3.Data>;
    eth_submitHashrate(_hashrate: web3.Quantity, _clientID: web3.Quantity): Promise<false>;
    eth_submitWork(_nonce: web3.Data, _powHash: web3.Data, _mixDigest: web3.Data): Promise<false>;
    eth_syncing(): Promise<false>;
    eth_uninstallFilter(_filterID: web3.Quantity): Promise<boolean>;
    txpool_content(): Promise<Record<string, any>>;
    parity_pendingTransactions(_limit?: number | null, _filter?: Record<string, any>): Promise<any[]>;
}
