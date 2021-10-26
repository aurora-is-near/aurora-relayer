export declare type Data = string;
export declare type Quantity = string;
export declare type Tag = 'latest' | 'earliest' | 'pending';
export declare type TypedData = unknown;
export declare type BlockResult = Record<string, Quantity | Data | Data[] | TransactionResult[] | null>;
export interface TransactionForCall {
    from?: Data;
    to: Data;
    gas?: Quantity;
    gasPrice?: Quantity;
    value?: Quantity;
    data?: Data;
}
export interface TransactionForSend {
    from: Data;
    to?: Data;
    gas?: Quantity;
    gasPrice?: Quantity;
    value?: Quantity;
    data: Data;
    nonce?: Quantity;
}
export interface TransactionResult {
    blockHash: Data | null;
    blockNumber: Quantity | null;
    transactionIndex: Quantity | null;
    hash: Data;
    from: Data;
    to: Data | null;
    gas: Quantity;
    gasPrice: Quantity;
    value: Quantity;
    input: Data;
    nonce: Quantity;
    v: Quantity;
    r: Data;
    s: Data;
}
export declare type TransactionReceipt = Record<string, Data | Quantity | LogObject[] | null>;
export declare type FilterTopic = FilterTopic[] | Data | null;
export interface FilterOptions {
    fromBlock?: Quantity | Tag;
    toBlock?: Quantity | Tag;
    address: Data | Data[];
    topics?: FilterTopic[];
    blockHash?: Data;
}
export declare type ProofResult = Record<string, unknown>;
export declare type SyncStatus = Record<string, Quantity>;
export declare type LogObject = Data | Record<string, boolean | Quantity | Data | Data[] | null>;
export interface Service {
    web3_clientVersion(_request: any): Promise<string>;
    web3_sha3(_request: any, input: Data): Promise<Data>;
    net_listening(_request: any): Promise<boolean>;
    net_peerCount(_request: any): Promise<Quantity>;
    net_version(_request: any): Promise<string>;
    eth_accounts(_request: any): Promise<Data[]>;
    eth_blockNumber(_request: any): Promise<Quantity>;
    eth_call(_request: any, transaction: TransactionForCall, blockNumber?: Quantity | Tag): Promise<Data>;
    eth_chainId(_request: any): Promise<Quantity>;
    eth_coinbase(_request: any): Promise<Data>;
    eth_compileLLL(_request: any, code: string): Promise<Data>;
    eth_compileSerpent(_request: any, code: string): Promise<Data>;
    eth_compileSolidity(_request: any, code: string): Promise<Data>;
    eth_estimateGas(_request: any, transaction: TransactionForCall, blockNumber?: Quantity | Tag): Promise<Quantity>;
    eth_gasPrice(_request: any): Promise<Quantity>;
    eth_getBalance(_request: any, address: Data, blockNumber?: Quantity | Tag): Promise<Quantity>;
    eth_getBlockByHash(_request: any, blockHash: Data, fullObject?: boolean): Promise<BlockResult | null>;
    eth_getBlockByNumber(_request: any, blockNumber: Quantity | Tag, fullObject?: boolean): Promise<BlockResult | null>;
    eth_getBlockTransactionCountByHash(_request: any, blockHash: Data): Promise<Quantity | null>;
    eth_getBlockTransactionCountByNumber(_request: any, blockNumber: Quantity | Tag): Promise<Quantity | null>;
    eth_getCode(_request: any, address: Data, blockNumber: Quantity | Tag): Promise<Data>;
    eth_getCompilers(__request: any, request: any): Promise<string[]>;
    eth_getFilterChanges(_request: any, filterID: Quantity): Promise<LogObject[]>;
    eth_getFilterLogs(_request: any, filterID: Quantity): Promise<LogObject[]>;
    eth_getLogs(_request: any, filter: FilterOptions): Promise<LogObject[]>;
    eth_getProof(_request: any, address: Data, keys: Data[], blockNumber: Quantity | Tag): Promise<ProofResult>;
    eth_getStorageAt(_request: any, address: Data, key: Quantity, blockNumber: Quantity | Tag): Promise<Data>;
    eth_getTransactionByBlockHashAndIndex(_request: any, blockHash: Data, transactionIndex: Quantity): Promise<TransactionResult | null>;
    eth_getTransactionByBlockNumberAndIndex(_request: any, blockNumber: Quantity | Tag, transactionIndex: Quantity): Promise<TransactionResult | null>;
    eth_getTransactionByHash(_request: any, transactionHash: Data): Promise<TransactionResult | null>;
    eth_getTransactionCount(_request: any, address: Data, blockNumber: Quantity | Tag): Promise<Quantity>;
    eth_getTransactionReceipt(_request: any, transactionHash: string): Promise<TransactionReceipt | null>;
    eth_getUncleByBlockHashAndIndex(_request: any, blockHash: Data, uncleIndex: Quantity): Promise<BlockResult | null>;
    eth_getUncleByBlockNumberAndIndex(_request: any, blockNumber: Quantity | Tag, uncleIndex: Quantity): Promise<BlockResult | null>;
    eth_getUncleCountByBlockHash(_request: any, blockHash: Data): Promise<Quantity | null>;
    eth_getUncleCountByBlockNumber(_request: any, blockNumber: Quantity | Tag): Promise<Quantity | null>;
    eth_getWork(_request: any): Promise<Data[]>;
    eth_hashrate(_request: any): Promise<Quantity>;
    eth_mining(_request: any): Promise<boolean>;
    eth_newBlockFilter(_request: any): Promise<Quantity>;
    eth_newFilter(_request: any, filter: FilterOptions): Promise<Quantity>;
    eth_newPendingTransactionFilter(_request: any): Promise<Quantity>;
    eth_pendingTransactions(_request: any): Promise<Record<string, string | number | null>[]>;
    eth_protocolVersion(_request: any): Promise<string>;
    eth_sendRawTransaction(_request: any, transaction: Data): Promise<Data>;
    eth_sendTransaction(_request: any, transaction: TransactionForSend): Promise<Data>;
    eth_sign(_request: any, account: Data, message: Data): Promise<Data>;
    eth_signTransaction(_request: any, transaction: TransactionForSend): Promise<Data>;
    eth_signTypedData(_request: any, address: Data, data: TypedData): Promise<Data>;
    eth_submitHashrate(_request: any, hashrate: Quantity, clientID: Quantity): Promise<boolean>;
    eth_submitWork(_request: any, nonce: Data, powHash: Data, mixDigest: Data): Promise<boolean>;
    eth_syncing(_request: any): Promise<SyncStatus | false>;
    eth_uninstallFilter(_request: any, filterID: Quantity): Promise<boolean>;
    txpool_content(_request: any): Promise<Record<string, any>>;
    txpool_inspect(_request: any): Promise<Record<string, any>>;
    txpool_status(_request: any): Promise<Record<string, number>>;
    parity_pendingTransactions(_request: any, limit?: number | null, filter?: Record<string, any>): Promise<any[]>;
}
