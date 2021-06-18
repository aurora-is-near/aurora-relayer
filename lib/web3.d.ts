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
    web3_clientVersion(): Promise<string>;
    web3_sha3(input: Data): Promise<Data>;
    net_listening(): Promise<boolean>;
    net_peerCount(): Promise<Quantity>;
    net_version(): Promise<string>;
    eth_accounts(): Promise<Data[]>;
    eth_blockNumber(): Promise<Quantity>;
    eth_call(transaction: TransactionForCall, blockNumber?: Quantity | Tag): Promise<Data>;
    eth_chainId(): Promise<Quantity>;
    eth_coinbase(): Promise<Data>;
    eth_compileLLL(code: string): Promise<Data>;
    eth_compileSerpent(code: string): Promise<Data>;
    eth_compileSolidity(code: string): Promise<Data>;
    eth_estimateGas(transaction: TransactionForCall, blockNumber?: Quantity | Tag): Promise<Quantity>;
    eth_gasPrice(): Promise<Quantity>;
    eth_getBalance(address: Data, blockNumber?: Quantity | Tag): Promise<Quantity>;
    eth_getBlockByHash(blockHash: Data, fullObject?: boolean): Promise<BlockResult | null>;
    eth_getBlockByNumber(blockNumber: Quantity | Tag, fullObject?: boolean): Promise<BlockResult | null>;
    eth_getBlockTransactionCountByHash(blockHash: Data): Promise<Quantity | null>;
    eth_getBlockTransactionCountByNumber(blockNumber: Quantity | Tag): Promise<Quantity | null>;
    eth_getCode(address: Data, blockNumber: Quantity | Tag): Promise<Data>;
    eth_getCompilers(): Promise<string[]>;
    eth_getFilterChanges(filterID: Quantity): Promise<LogObject[]>;
    eth_getFilterLogs(filterID: Quantity): Promise<LogObject[]>;
    eth_getLogs(filter: FilterOptions): Promise<LogObject[]>;
    eth_getProof(address: Data, keys: Data[], blockNumber: Quantity | Tag): Promise<ProofResult>;
    eth_getStorageAt(address: Data, key: Quantity, blockNumber: Quantity | Tag): Promise<Data>;
    eth_getTransactionByBlockHashAndIndex(blockHash: Data, transactionIndex: Quantity): Promise<TransactionResult | null>;
    eth_getTransactionByBlockNumberAndIndex(blockNumber: Quantity | Tag, transactionIndex: Quantity): Promise<TransactionResult | null>;
    eth_getTransactionByHash(transactionHash: Data): Promise<TransactionResult | null>;
    eth_getTransactionCount(address: Data, blockNumber: Quantity | Tag): Promise<Quantity>;
    eth_getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt | null>;
    eth_getUncleByBlockHashAndIndex(blockHash: Data, uncleIndex: Quantity): Promise<BlockResult | null>;
    eth_getUncleByBlockNumberAndIndex(blockNumber: Quantity | Tag, uncleIndex: Quantity): Promise<BlockResult | null>;
    eth_getUncleCountByBlockHash(blockHash: Data): Promise<Quantity | null>;
    eth_getUncleCountByBlockNumber(blockNumber: Quantity | Tag): Promise<Quantity | null>;
    eth_getWork(): Promise<Data[]>;
    eth_hashrate(): Promise<Quantity>;
    eth_mining(): Promise<boolean>;
    eth_newBlockFilter(): Promise<Quantity>;
    eth_newFilter(filter: FilterOptions): Promise<Quantity>;
    eth_newPendingTransactionFilter(): Promise<Quantity>;
    eth_pendingTransactions(): Promise<Record<string, string | number | null>[]>;
    eth_protocolVersion(): Promise<string>;
    eth_sendRawTransaction(transaction: Data): Promise<Data>;
    eth_sendTransaction(transaction: TransactionForSend): Promise<Data>;
    eth_sign(account: Data, message: Data): Promise<Data>;
    eth_signTransaction(transaction: TransactionForSend): Promise<Data>;
    eth_signTypedData(address: Data, data: TypedData): Promise<Data>;
    eth_submitHashrate(hashrate: Quantity, clientID: Quantity): Promise<boolean>;
    eth_submitWork(nonce: Data, powHash: Data, mixDigest: Data): Promise<boolean>;
    eth_syncing(): Promise<SyncStatus | false>;
    eth_uninstallFilter(filterID: Quantity): Promise<boolean>;
    txpool_content(): Promise<Record<string, any>>;
    parity_pendingTransactions(limit?: number | null, filter?: Record<string, any>): Promise<any[]>;
}
