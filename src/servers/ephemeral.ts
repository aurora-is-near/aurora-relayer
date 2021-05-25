/* This is free and unencumbered software released into the public domain. */

import * as web3 from '../web3.js';
import {
  RevertError,
  TransactionError,
  UnexpectedError,
  unimplemented,
} from '../errors.js';
import { SkeletonServer } from './skeleton.js';

import {
  Address,
  BlockOptions,
  BlockID,
  formatU256,
  hexToBase58,
  hexToBytes,
  intToHex,
  bytesToHex,
} from '@aurora-is-near/engine';
import { keccak256 } from 'ethereumjs-util';

export class EphemeralServer extends SkeletonServer {
  protected readonly filters: Map<number, Filter> = new Map();
  protected filterID = 0;
  protected latestBlockID: BlockID = 0;

  protected async _init(): Promise<void> {
    this.latestBlockID = parseInt(await this.eth_blockNumber(), 16);
  }

  async eth_blockNumber(): Promise<web3.Quantity> {
    const height = (await this.engine.getBlockHeight()).unwrap();
    return intToHex(height);
  }

  async eth_call(
    transaction: web3.TransactionForCall,
    blockNumber?: web3.Quantity | web3.Tag
  ): Promise<web3.Data> {
    unimplemented('eth_call'); // TODO
    return '';
  }

  async eth_chainId(): Promise<web3.Quantity> {
    // EIP-695
    const chainID = (await this.engine.getChainID()).unwrap();
    return intToHex(chainID);
  }

  async eth_coinbase(): Promise<web3.Data> {
    return (await this.engine.getCoinbase()).unwrap().toString();
  }

  async eth_getBalance(
    address: web3.Data,
    blockNumber?: web3.Quantity | web3.Tag
  ): Promise<web3.Quantity> {
    const address_ = Address.parse(address).unwrap();
    const balance = (await this.engine.getBalance(address_)).unwrap();
    return intToHex(balance);
  }

  async eth_getBlockByHash(
    blockHash: web3.Data,
    fullObject?: boolean
  ): Promise<web3.BlockResult | null> {
    const blockHash_ = blockHash.startsWith('0x')
      ? hexToBase58(blockHash)
      : blockHash;
    const options: BlockOptions = {
      contractID: this.engine.contractID,
      transactions: fullObject ? 'full' : 'id',
    };
    const result = await this.engine.getBlock(blockHash_, options);
    if (result.isErr()) return null;
    const block = result.unwrap();
    const response = block.toJSON();
    if (fullObject) {
      response.transactions.forEach((tx: any, i: number) => {
        tx.blockHash = block.hash;
        tx.blockNumber = intToHex(block.number);
        tx.transactionIndex = intToHex(i);
      });
    }
    return response;
  }

  async eth_getBlockByNumber(
    blockNumber: web3.Quantity | web3.Tag,
    fullObject?: boolean
  ): Promise<web3.BlockResult | null> {
    const blockNumber_ = blockNumber.startsWith('0x')
      ? parseInt(blockNumber, 16)
      : blockNumber;
    const options: BlockOptions = {
      contractID: this.engine.contractID,
      transactions: fullObject ? 'full' : 'id',
    };
    const result = await this.engine.getBlock(blockNumber_, options);
    if (result.isErr()) return null;
    const block = result.unwrap();
    const response = block.toJSON();
    if (fullObject) {
      response.transactions.forEach((tx: any, i: number) => {
        tx.blockHash = block.hash;
        tx.blockNumber = intToHex(block.number);
        tx.transactionIndex = intToHex(i);
      });
    }
    return response;
  }

  async eth_getBlockTransactionCountByHash(
    blockHash: web3.Data
  ): Promise<web3.Quantity | null> {
    const blockHash_ = blockHash.startsWith('0x')
      ? hexToBase58(blockHash)
      : blockHash;
    const result = await this.engine.getBlockTransactionCount(blockHash_);
    return result?.isOk() ? intToHex(result.unwrap()) : null;
  }

  async eth_getBlockTransactionCountByNumber(
    blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.Quantity | null> {
    const blockNumber_ = blockNumber.startsWith('0x')
      ? parseInt(blockNumber, 16)
      : blockNumber;
    const result = await this.engine.getBlockTransactionCount(blockNumber_);
    return result?.isOk() ? intToHex(result.unwrap()) : null;
  }

  async eth_getCode(
    address: web3.Data,
    _blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.Data> {
    const address_ = Address.parse(address).unwrap();
    const code = (await this.engine.getCode(address_)).unwrap();
    return bytesToHex(code);
  }

  async eth_getFilterChanges(
    filterID: web3.Quantity
  ): Promise<web3.LogObject[]> {
    const filterID_ = parseInt(filterID, 16);
    if (filterID_ === 0) {
      return [];
    }
    unimplemented('eth_getFilterChanges'); // TODO
    return [];
  }

  async eth_getFilterLogs(filterID: web3.Quantity): Promise<web3.LogObject[]> {
    const filterID_ = parseInt(filterID, 16);
    if (filterID_ === 0) {
      return [];
    }
    unimplemented('eth_getFilterLogs'); // TODO
    return [];
  }

  async eth_getLogs(_filter: web3.FilterOptions): Promise<web3.LogObject[]> {
    unimplemented('eth_getLogs'); // TODO
    return [];
  }

  async eth_getStorageAt(
    address: web3.Data,
    key: web3.Quantity,
    blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.Data> {
    const address_ = Address.parse(address).unwrap();
    const result = (await this.engine.getStorageAt(address_, key)).unwrap();
    return formatU256(result);
  }

  async eth_getTransactionByBlockHashAndIndex(
    blockHash: web3.Data,
    transactionIndex: web3.Quantity
  ): Promise<web3.TransactionResult | null> {
    const blockHash_ = blockHash.startsWith('0x')
      ? hexToBase58(blockHash)
      : blockHash;
    const transactionIndex_ = parseInt(transactionIndex, 16);
    const options: BlockOptions = {
      contractID: this.engine.contractID,
      transactions: 'full',
    };
    const result = await this.engine.getBlock(blockHash_, options);
    if (result.isErr()) return null;
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

  async eth_getTransactionByBlockNumberAndIndex(
    blockNumber: web3.Quantity | web3.Tag,
    transactionIndex: web3.Quantity
  ): Promise<web3.TransactionResult | null> {
    const blockNumber_ = blockNumber.startsWith('0x')
      ? parseInt(blockNumber, 16)
      : blockNumber;
    const transactionIndex_ = parseInt(transactionIndex, 16);
    const options: BlockOptions = {
      contractID: this.engine.contractID,
      transactions: 'full',
    };
    const result = await this.engine.getBlock(blockNumber_, options);
    if (result.isErr()) return null;
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

  async eth_getTransactionByHash(
    transactionHash: web3.Data
  ): Promise<web3.TransactionResult | null> {
    const transactionHash_ = hexToBytes(transactionHash);
    console.debug(transactionHash_); // TODO
    unimplemented('eth_getTransactionByHash'); // TODO
    return null;
  }

  async eth_getTransactionCount(
    address: web3.Data,
    _blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.Quantity> {
    //const [address] = expectArgs(params, 1, 2, "cannot request transaction count without specifying address");
    const address_ = Address.parse(address).unwrap();
    const nonce = (await this.engine.getNonce(address_)).unwrap();
    return intToHex(nonce);
  }

  async eth_getTransactionReceipt(
    transactionHash: string
  ): Promise<web3.TransactionReceipt | null> {
    unimplemented('eth_getTransactionReceipt'); // TODO
    return null;
  }

  async eth_getUncleCountByBlockHash(
    blockHash: web3.Data
  ): Promise<web3.Quantity | null> {
    const blockHash_ = blockHash.startsWith('0x')
      ? hexToBase58(blockHash)
      : blockHash;
    const result = await this.engine.hasBlock(blockHash_);
    return result?.isOk() ? intToHex(0) : null;
  }

  async eth_getUncleCountByBlockNumber(
    blockNumber: web3.Quantity | web3.Tag
  ): Promise<web3.Quantity | null> {
    const blockNumber_ = blockNumber.startsWith('0x')
      ? parseInt(blockNumber, 16)
      : blockNumber;
    const result = await this.engine.hasBlock(blockNumber_);
    return result?.isOk() ? intToHex(0) : null;
  }

  async eth_newBlockFilter(): Promise<web3.Quantity> {
    const id = ++this.filterID;
    this.filters.set(id, { blockID: this.latestBlockID });
    return intToHex(id);
  }

  async eth_newFilter(_filter: web3.FilterOptions): Promise<web3.Quantity> {
    unimplemented('eth_newFilter'); // TODO
    return intToHex(0);
  }

  async eth_newPendingTransactionFilter(): Promise<web3.Quantity> {
    return intToHex(0); // designates the empty filter
  }

  async eth_sendRawTransaction(transaction: web3.Data): Promise<web3.Data> {
    const transactionBytes = Buffer.from(hexToBytes(transaction));
    const transactionHash = keccak256(transactionBytes);
    return (await this.engine.submit(transactionBytes)).match({
      ok: (result) => {
        if (!result.status) {
          throw new RevertError(result.output);
        }
        return bytesToHex(transactionHash);
      },
      err: (code) => {
        if (!code.startsWith('ERR_')) {
          throw new UnexpectedError(code);
        }
        throw new TransactionError(code);
      },
    });
  }

  async eth_uninstallFilter(filterID: web3.Quantity): Promise<boolean> {
    const filterID_ = parseInt(filterID, 16);
    if (filterID_ === 0) {
      return true;
    }
    unimplemented('eth_uninstallFilter'); // TODO
    return false;
  }
}

interface Filter {
  blockID: BlockID;
}
