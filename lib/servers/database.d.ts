import { SkeletonServer } from './skeleton.js';
import { Bus } from '../bus.js';
import { pg } from '../database.js';
import { Request } from '../request.js';
import * as web3 from '../web3.js';
export declare class DatabaseServer extends SkeletonServer {
    protected pgClient?: pg.Client;
    protected bus?: Bus;
    protected _init(): Promise<void>;
    protected _query(query: string | /*sql.SelectStatement*/ any, args?: unknown[]): Promise<pg.QueryResult<any>>;
    eth_blockNumber(_request: Request): Promise<web3.Quantity>;
    eth_call(_request: Request, transaction: web3.TransactionForCall, blockNumberOrHash?: web3.Quantity | web3.Tag | web3.Data): Promise<web3.Data>;
    eth_chainId(_request: Request): Promise<web3.Quantity>;
    eth_coinbase(_request: Request): Promise<web3.Data>;
    eth_gasPrice(_request: Request): Promise<web3.Quantity>;
    eth_getBalance(_request: Request, address: web3.Data, blockNumber?: web3.Quantity | web3.Tag): Promise<web3.Quantity>;
    eth_getBlockByHash(_request: Request, blockHash: web3.Data, fullObject?: boolean): Promise<web3.BlockResult | null>;
    eth_getBlockByNumber(_request: Request, blockNumber: web3.Quantity | web3.Tag, fullObject?: boolean): Promise<web3.BlockResult | null>;
    eth_getBlockTransactionCountByHash(_request: Request, blockHash: web3.Data): Promise<web3.Quantity | null>;
    eth_getBlockTransactionCountByNumber(_request: Request, blockNumber: web3.Quantity | web3.Tag): Promise<web3.Quantity | null>;
    eth_getCode(_request: Request, address: web3.Data, blockNumber: web3.Quantity | web3.Tag): Promise<web3.Data>;
    eth_getFilterChanges(_request: Request, filterID: web3.Quantity): Promise<web3.LogObject[]>;
    eth_getFilterLogs(_request: Request, filterID: web3.Quantity): Promise<web3.LogObject[]>;
    eth_getLogs(_request: Request, filter: web3.FilterOptions): Promise<web3.LogObject[]>;
    eth_getStorageAt(_request: Request, address: web3.Data, key: web3.Quantity, blockNumber: web3.Quantity | web3.Tag): Promise<web3.Data>;
    eth_getTransactionByBlockHashAndIndex(_request: Request, blockHash: web3.Data, transactionIndex: web3.Quantity): Promise<web3.TransactionResult | null>;
    eth_getTransactionByBlockNumberAndIndex(_request: Request, blockNumber: web3.Quantity | web3.Tag, transactionIndex: web3.Quantity): Promise<web3.TransactionResult | null>;
    eth_getTransactionByHash(_request: Request, transactionHash: web3.Data): Promise<web3.TransactionResult | null>;
    eth_getTransactionCount(_request: Request, address: web3.Data, blockNumber: web3.Quantity | web3.Tag): Promise<web3.Quantity>;
    eth_getTransactionReceipt(_request: Request, transactionHash: string): Promise<web3.TransactionReceipt | null>;
    eth_getUncleCountByBlockHash(_request: Request, blockHash: web3.Data): Promise<web3.Quantity | null>;
    eth_getUncleCountByBlockNumber(_request: Request, blockNumber: web3.Quantity | web3.Tag): Promise<web3.Quantity | null>;
    eth_newBlockFilter(_request: Request): Promise<web3.Quantity>;
    eth_newFilter(_request: Request, filter: web3.FilterOptions): Promise<web3.Quantity>;
    eth_newPendingTransactionFilter(_request: Request): Promise<web3.Quantity>;
    eth_sendRawTransaction(request: any, transaction: web3.Data): Promise<web3.Data>;
    eth_subscribe(_request: Request, _subsciptionType: web3.Data, _filter: any): Promise<web3.Data>;
    eth_uninstallFilter(_request: Request, filterID: web3.Quantity): Promise<boolean>;
    eth_unsubscribe(_request: Request, _subsciptionId: web3.Data): Promise<boolean>;
    protected _fetchCurrentBlockID(): Promise<bigint>;
    protected _fetchEvents(transactionID: Uint8Array): Promise<unknown[]>;
    protected _fetchTransactions(blockID: bigint | number | Uint8Array, fullObject: boolean): Promise<unknown[] | string[]>;
}
