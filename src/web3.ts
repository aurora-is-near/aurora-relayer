/* This is free and unencumbered software released into the public domain. */

import { Request } from './request.js';

export type Data = string;
export type Quantity = string;
export type Tag = 'latest' | 'earliest' | 'pending';
export type TypedData = unknown;

export type BlockResult = Record<
  string,
  Quantity | Data | Data[] | TransactionResult[] | null
>;

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

export type TransactionReceipt = Record<
  string,
  Data | Quantity | LogObject[] | null
>;

export type FilterTopic = FilterTopic[] | Data | null;

export interface FilterOptions {
  fromBlock?: Quantity | Tag;
  toBlock?: Quantity | Tag;
  address?: Data | Data[];
  topics?: FilterTopic[];
  blockHash?: Data; // EIP-234
  index?: Quantity | null;
}

export type ProofResult = Record<string, unknown>;
export type SyncStatus = Record<string, Quantity>;
export type LogObject =
  | Data
  | Record<string, boolean | Quantity | Data | Data[] | null>;

export interface Service {
  web3_clientVersion(_request: Request): Promise<string>;
  web3_sha3(_request: Request, input: Data): Promise<Data>;
  net_listening(_request: Request): Promise<boolean>;
  net_peerCount(_request: Request): Promise<Quantity>;
  net_version(_request: Request): Promise<string>;
  eth_accounts(_request: Request): Promise<Data[]>;
  eth_blockNumber(_request: Request): Promise<Quantity>;
  eth_call(
    _request: Request,
    transaction: TransactionForCall,
    blockNumber?: Quantity | Tag
  ): Promise<Data>;
  eth_chainId(_request: Request): Promise<Quantity>; // EIP-695
  eth_coinbase(_request: Request): Promise<Data>;
  eth_compileLLL(_request: Request, code: string): Promise<Data>;
  eth_compileSerpent(_request: Request, code: string): Promise<Data>;
  eth_compileSolidity(_request: Request, code: string): Promise<Data>;
  eth_estimateGas(
    _request: Request,
    transaction: TransactionForCall,
    blockNumber?: Quantity | Tag
  ): Promise<Quantity>;
  eth_gasPrice(_request: Request): Promise<Quantity>;
  eth_getBalance(
    _request: Request,
    address: Data,
    blockNumber?: Quantity | Tag
  ): Promise<Quantity>;
  eth_getBlockByHash(
    _request: Request,
    blockHash: Data,
    fullObject?: boolean
  ): Promise<BlockResult | null>;
  eth_getBlockByNumber(
    _request: Request,
    blockNumber: Quantity | Tag,
    fullObject?: boolean
  ): Promise<BlockResult | null>;
  eth_getBlockTransactionCountByHash(
    _request: Request,
    blockHash: Data
  ): Promise<Quantity | null>;
  eth_getBlockTransactionCountByNumber(
    _request: Request,
    blockNumber: Quantity | Tag
  ): Promise<Quantity | null>;
  eth_getCode(
    _request: Request,
    address: Data,
    blockNumber: Quantity | Tag
  ): Promise<Data>;
  eth_getCompilers(__request: Request, request: any): Promise<string[]>;
  eth_getFilterChanges(
    _request: Request,
    filterID: Quantity
  ): Promise<LogObject[]>;
  eth_getFilterLogs(
    _request: Request,
    filterID: Quantity
  ): Promise<LogObject[]>;
  eth_getLogs(_request: Request, filter: FilterOptions): Promise<LogObject[]>;
  eth_getProof(
    _request: Request,
    address: Data,
    keys: Data[],
    blockNumber: Quantity | Tag
  ): Promise<ProofResult>; // EIP-1186
  eth_getStorageAt(
    _request: Request,
    address: Data,
    key: Quantity,
    blockNumber: Quantity | Tag
  ): Promise<Data>;
  eth_getTransactionByBlockHashAndIndex(
    _request: Request,
    blockHash: Data,
    transactionIndex: Quantity
  ): Promise<TransactionResult | null>;
  eth_getTransactionByBlockNumberAndIndex(
    _request: Request,
    blockNumber: Quantity | Tag,
    transactionIndex: Quantity
  ): Promise<TransactionResult | null>;
  eth_getTransactionByHash(
    _request: Request,
    transactionHash: Data
  ): Promise<TransactionResult | null>;
  eth_getTransactionCount(
    _request: Request,
    address: Data,
    blockNumber: Quantity | Tag
  ): Promise<Quantity>;
  eth_getTransactionReceipt(
    _request: Request,
    transactionHash: string
  ): Promise<TransactionReceipt | null>;
  eth_getUncleByBlockHashAndIndex(
    _request: Request,
    blockHash: Data,
    uncleIndex: Quantity
  ): Promise<BlockResult | null>;
  eth_getUncleByBlockNumberAndIndex(
    _request: Request,
    blockNumber: Quantity | Tag,
    uncleIndex: Quantity
  ): Promise<BlockResult | null>;
  eth_getUncleCountByBlockHash(
    _request: Request,
    blockHash: Data
  ): Promise<Quantity | null>;
  eth_getUncleCountByBlockNumber(
    _request: Request,
    blockNumber: Quantity | Tag
  ): Promise<Quantity | null>;
  eth_getWork(_request: Request): Promise<Data[]>;
  eth_hashrate(_request: Request): Promise<Quantity>;
  eth_mining(_request: Request): Promise<boolean>;
  eth_newBlockFilter(_request: Request): Promise<Quantity>;
  eth_newFilter(_request: Request, filter: FilterOptions): Promise<Quantity>;
  eth_newPendingTransactionFilter(_request: Request): Promise<Quantity>;
  eth_pendingTransactions(
    _request: Request
  ): Promise<Record<string, string | number | null>[]>; // undocumented
  eth_protocolVersion(_request: Request): Promise<string>;
  eth_sendRawTransaction(_request: Request, transaction: Data): Promise<Data>;
  eth_sendTransaction(
    _request: Request,
    transaction: TransactionForSend
  ): Promise<Data>;
  eth_sign(_request: Request, account: Data, message: Data): Promise<Data>;
  eth_signTransaction(
    _request: Request,
    transaction: TransactionForSend
  ): Promise<Data>;
  eth_signTypedData(
    _request: Request,
    address: Data,
    data: TypedData
  ): Promise<Data>; // EIP-712
  eth_submitHashrate(
    _request: Request,
    hashrate: Quantity,
    clientID: Quantity
  ): Promise<boolean>;
  eth_submitWork(
    _request: Request,
    nonce: Data,
    powHash: Data,
    mixDigest: Data
  ): Promise<boolean>;
  eth_syncing(_request: Request): Promise<SyncStatus | false>;
  eth_uninstallFilter(_request: Request, filterID: Quantity): Promise<boolean>;
  txpool_content(_request: Request): Promise<Record<string, any>>;
  txpool_inspect(_request: Request): Promise<Record<string, any>>;
  txpool_status(_request: Request): Promise<Record<string, number>>;
  parity_pendingTransactions(
    _request: Request,
    limit?: number | null,
    filter?: Record<string, any>
  ): Promise<any[]>;
}
