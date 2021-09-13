/* This is free and unencumbered software released into the public domain. */

import * as web3 from '../web3.js';
import { Config } from '../config.js';
import { unimplemented, unsupported } from '../errors.js';

import { bytesToHex, Engine, hexToInt, intToHex } from '@aurora-is-near/engine';
import { keccakFromHexString } from 'ethereumjs-util';
import { Logger } from 'pino';

export abstract class SkeletonServer implements web3.Service {
  constructor(
    public readonly config: Config,
    public readonly logger: Logger,
    public readonly engine: Engine
  ) {
    this._init();
  }

  protected abstract _init(): Promise<void>;

  // web3_*

  async web3_clientVersion(): Promise<string> {
    return 'Aurora-Relayer/0.0.0'; // TODO
  }

  async web3_sha3(input: web3.Data): Promise<web3.Data> {
    return bytesToHex(keccakFromHexString(input));
  }

  // net_*

  async net_listening(): Promise<boolean> {
    return true;
  }

  async net_peerCount(): Promise<web3.Quantity> {
    return intToHex(0);
  }

  async net_version(): Promise<string> {
    return hexToInt(await this.eth_chainId()).toString();
  }

  // eth_*

  async eth_accounts(): Promise<web3.Data[]> {
    return []; // no private keys under management here
  }

  async eth_blockNumber(): Promise<web3.Quantity> {
    unimplemented('eth_blockNumber');
    return intToHex(0);
  }

  async eth_call(
    _transaction: web3.TransactionForCall,
    _blockNumber?: web3.Quantity | web3.Tag
  ): Promise<web3.Data> {
    unimplemented('eth_call');
    return '0x';
  }

  async eth_chainId(): Promise<web3.Quantity> {
    // EIP-695
    unimplemented('eth_chainId');
    return intToHex(0);
  }

  async eth_coinbase(): Promise<web3.Data> {
    unimplemented('eth_coinbase');
    return '0x';
  }

  async eth_compileLLL(_code: string): Promise<web3.Data> {
    unsupported('eth_compileLLL');
    return '0x';
  }

  async eth_compileSerpent(_code: string): Promise<web3.Data> {
    unsupported('eth_compileSerpent');
    return '0x';
  }

  async eth_compileSolidity(_code: string): Promise<web3.Data> {
    unsupported('eth_compileSolidity');
    return '0x';
  }

  async eth_estimateGas(
    _transaction: web3.TransactionForCall,
    _blockNumber?: web3.Quantity | web3.Tag
  ): Promise<web3.Quantity> {
    // See: https://www.trufflesuite.com/docs/truffle/reference/configuration
    return intToHex(6_721_975); // 0x6691b7
  }

  async eth_gasPrice(): Promise<web3.Quantity> {
    return intToHex(0);
  }

  async eth_getBalance(
    _address: web3.Data,
    _blockNumber?: web3.Quantity | web3.Tag
  ): Promise<web3.Quantity> {
    unimplemented('eth_getBalance');
    return intToHex(0);
  }

  async eth_getBlockByHash(
    _blockHash: web3.Data,
    _fullObject?: boolean
  ): Promise<web3.BlockResult | null> {
    unimplemented('eth_getBlockByHash');
    return null;
  }

  async eth_getBlockByNumber(
    _blockNumber: web3.Quantity | web3.Tag,
    _fullObject?: boolean
  ): Promise<web3.BlockResult | null> {
    unimplemented('eth_getBlockByNumber');
    return null;
  }

  async eth_getBlockTransactionCountByHash(
    _blockHash: web3.Data
  ): Promise<web3.Quantity | null> {
    unimplemented('eth_getBlockTransactionCountByHash');
    return null;
  }

  async eth_getBlockTransactionCountByNumber(
    _blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.Quantity | null> {
    unimplemented('eth_getBlockTransactionCountByNumber');
    return null;
  }

  async eth_getCode(
    _address: web3.Data,
    _blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.Data> {
    unimplemented('eth_getCode');
    return '0x';
  }

  async eth_getCompilers(): Promise<string[]> {
    return [];
  }

  async eth_getFilterChanges(
    _filterID: web3.Quantity
  ): Promise<web3.LogObject[]> {
    unimplemented('eth_getFilterChanges');
    return [];
  }

  async eth_getFilterLogs(_filterID: web3.Quantity): Promise<web3.LogObject[]> {
    unimplemented('eth_getFilterLogs');
    return [];
  }

  async eth_getLogs(_filter: web3.FilterOptions): Promise<web3.LogObject[]> {
    unimplemented('eth_getLogs');
    return [];
  }

  async eth_getProof(
    _address: web3.Data,
    _keys: web3.Data[],
    _blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.ProofResult> {
    // EIP-1186
    unsupported('eth_getProof'); // EIP-1186 TODO?
    return {};
  }

  async eth_getStorageAt(
    _address: web3.Data,
    _key: web3.Quantity,
    _blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.Data> {
    unimplemented('eth_getStorageAt');
    return '0x';
  }

  async eth_getTransactionByBlockHashAndIndex(
    _blockHash: web3.Data,
    _transactionIndex: web3.Quantity
  ): Promise<web3.TransactionResult | null> {
    unimplemented('eth_getTransactionByBlockHashAndIndex');
    return null;
  }

  async eth_getTransactionByBlockNumberAndIndex(
    _blockNumber: web3.Quantity | web3.Tag,
    _transactionIndex: web3.Quantity
  ): Promise<web3.TransactionResult | null> {
    unimplemented('eth_getTransactionByBlockNumberAndIndex');
    return null;
  }

  async eth_getTransactionByHash(
    _transactionHash: web3.Data
  ): Promise<web3.TransactionResult | null> {
    unimplemented('eth_getTransactionByHash');
    return null;
  }

  async eth_getTransactionCount(
    _address: web3.Data,
    _blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.Quantity> {
    unimplemented('eth_getTransactionCount');
    return intToHex(0);
  }

  async eth_getTransactionReceipt(
    _transactionHash: string
  ): Promise<web3.TransactionReceipt | null> {
    unimplemented('eth_getTransactionReceipt');
    return null;
  }

  async eth_getUncleByBlockHashAndIndex(
    _blockHash: web3.Data,
    _uncleIndex: web3.Quantity
  ): Promise<web3.BlockResult | null> {
    return null; // uncle blocks are never found
  }

  async eth_getUncleByBlockNumberAndIndex(
    _blockNumber: web3.Quantity | web3.Tag,
    _uncleIndex: web3.Quantity
  ): Promise<web3.BlockResult | null> {
    return null; // uncle blocks are never found
  }

  async eth_getUncleCountByBlockHash(
    _blockHash: web3.Data
  ): Promise<web3.Quantity | null> {
    unimplemented('eth_getUncleCountByBlockHash');
    return null;
  }

  async eth_getUncleCountByBlockNumber(
    _blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.Quantity | null> {
    unimplemented('eth_getUncleCountByBlockNumber');
    return null;
  }

  async eth_getWork(): Promise<web3.Data[]> {
    unsupported('eth_getWork');
    return [];
  }

  async eth_hashrate(): Promise<web3.Quantity> {
    return intToHex(0);
  }

  async eth_mining(): Promise<false> {
    return false;
  }

  async eth_newBlockFilter(): Promise<web3.Quantity> {
    unimplemented('eth_newBlockFilter');
    return intToHex(0);
  }

  async eth_newFilter(_filter: web3.FilterOptions): Promise<web3.Quantity> {
    unimplemented('eth_newFilter');
    return intToHex(0);
  }

  async eth_newPendingTransactionFilter(): Promise<web3.Quantity> {
    return intToHex(0); // designates the empty filter
  }

  async eth_pendingTransactions(): Promise<
    Record<string, string | number | null>[]
  > {
    // undocumented
    return [];
  }

  async eth_protocolVersion(): Promise<string> {
    return intToHex(0x41);
  }

  async eth_sendRawTransaction(_transaction: web3.Data): Promise<web3.Data> {
    unimplemented('eth_sendRawTransaction');
    return '0x';
  }

  async eth_sendTransaction(
    _transaction: web3.TransactionForSend
  ): Promise<web3.Data> {
    unsupported('eth_sendTransaction');
    return '0x';
  }

  async eth_sign(_account: web3.Data, _message: web3.Data): Promise<web3.Data> {
    unsupported('eth_sign'); // no private keys under management here
    return '0x';
  }

  async eth_signTransaction(
    _transaction: web3.TransactionForSend
  ): Promise<web3.Data> {
    unsupported('eth_signTransaction'); // no private keys under management here
    return '0x';
  }

  async eth_signTypedData(
    _address: web3.Data,
    _data: web3.TypedData
  ): Promise<web3.Data> {
    // EIP-712
    unsupported('eth_signTypedData'); // no private keys under management here
    return '0x';
  }

  async eth_submitHashrate(
    _hashrate: web3.Quantity,
    _clientID: web3.Quantity
  ): Promise<false> {
    unsupported('eth_submitHashrate');
    return false;
  }

  async eth_submitWork(
    _nonce: web3.Data,
    _powHash: web3.Data,
    _mixDigest: web3.Data
  ): Promise<false> {
    unsupported('eth_submitWork');
    return false;
  }

  async eth_syncing(): Promise<false> {
    return false;
  }

  async eth_uninstallFilter(_filterID: web3.Quantity): Promise<boolean> {
    unimplemented('eth_uninstallFilter');
    return false;
  }

  // @see {@link https://geth.ethereum.org/docs/rpc/ns-txpool#txpool_content}
  async txpool_content(): Promise<Record<string, any>> {
    return { pending: {}, queued: {} };
  }

  // @see {@link https://geth.ethereum.org/docs/rpc/ns-txpool#txpool_inspect}
  async txpool_inspect(): Promise<Record<string, any>> {
    return { pending: {}, queued: {} };
  }

  // @see {@link https://geth.ethereum.org/docs/rpc/ns-txpool#txpool_status}
  async txpool_status(): Promise<Record<string, number>> {
    return { pending: 0, queued: 0 };
  }

  // @see {@link https://openethereum.github.io/JSONRPC-parity-module#parity_pendingtransactions}
  async parity_pendingTransactions(
    _limit?: number | null,
    _filter?: Record<string, any>
  ): Promise<any[]> {
    return [];
  }
}
