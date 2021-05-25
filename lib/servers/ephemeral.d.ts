import * as web3 from '../web3.js';
import { SkeletonServer } from './skeleton.js';
import { BlockID } from '@aurora-is-near/engine';
export declare class EphemeralServer extends SkeletonServer {
    protected readonly filters: Map<number, Filter>;
    protected filterID: number;
    protected latestBlockID: BlockID;
    protected _init(): Promise<void>;
    eth_blockNumber(): Promise<web3.Quantity>;
    eth_call(transaction: web3.TransactionForCall, blockNumber?: web3.Quantity | web3.Tag): Promise<web3.Data>;
    eth_chainId(): Promise<web3.Quantity>;
    eth_coinbase(): Promise<web3.Data>;
    eth_getBalance(address: web3.Data, blockNumber?: web3.Quantity | web3.Tag): Promise<web3.Quantity>;
    eth_getBlockByHash(blockHash: web3.Data, fullObject?: boolean): Promise<web3.BlockResult | null>;
    eth_getBlockByNumber(blockNumber: web3.Quantity | web3.Tag, fullObject?: boolean): Promise<web3.BlockResult | null>;
    eth_getBlockTransactionCountByHash(blockHash: web3.Data): Promise<web3.Quantity | null>;
    eth_getBlockTransactionCountByNumber(blockNumber: web3.Quantity | web3.Tag): Promise<web3.Quantity | null>;
    eth_getCode(address: web3.Data, _blockNumber: web3.Quantity | web3.Tag): Promise<web3.Data>;
    eth_getFilterChanges(filterID: web3.Quantity): Promise<web3.LogObject[]>;
    eth_getFilterLogs(filterID: web3.Quantity): Promise<web3.LogObject[]>;
    eth_getLogs(_filter: web3.FilterOptions): Promise<web3.LogObject[]>;
    eth_getStorageAt(address: web3.Data, key: web3.Quantity, blockNumber: web3.Quantity | web3.Tag): Promise<web3.Data>;
    eth_getTransactionByBlockHashAndIndex(blockHash: web3.Data, transactionIndex: web3.Quantity): Promise<web3.TransactionResult | null>;
    eth_getTransactionByBlockNumberAndIndex(blockNumber: web3.Quantity | web3.Tag, transactionIndex: web3.Quantity): Promise<web3.TransactionResult | null>;
    eth_getTransactionByHash(transactionHash: web3.Data): Promise<web3.TransactionResult | null>;
    eth_getTransactionCount(address: web3.Data, _blockNumber: web3.Quantity | web3.Tag): Promise<web3.Quantity>;
    eth_getTransactionReceipt(transactionHash: string): Promise<web3.TransactionReceipt | null>;
    eth_getUncleCountByBlockHash(blockHash: web3.Data): Promise<web3.Quantity | null>;
    eth_getUncleCountByBlockNumber(blockNumber: web3.Quantity | web3.Tag): Promise<web3.Quantity | null>;
    eth_newBlockFilter(): Promise<web3.Quantity>;
    eth_newFilter(_filter: web3.FilterOptions): Promise<web3.Quantity>;
    eth_newPendingTransactionFilter(): Promise<web3.Quantity>;
    eth_sendRawTransaction(transaction: web3.Data): Promise<web3.Data>;
    eth_uninstallFilter(filterID: web3.Quantity): Promise<boolean>;
}
interface Filter {
    blockID: BlockID;
}
export {};
