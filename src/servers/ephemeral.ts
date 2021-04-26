/* This is free and unencumbered software released into the public domain. */

import { SkeletonServer } from './skeleton.js';

import * as api from '../api.js';
import { Config } from '../config.js';
import { unimplemented } from '../errors.js';
import { NearProvider } from '../provider.js';

import { Address, BlockOptions, Engine, formatU256, hexToBase58, hexToBytes, intToHex } from '@aurora-is-near/engine';
import { Logger } from 'pino';

export class EphemeralServer extends SkeletonServer {
    public readonly filters: Map<number, any> = new Map();

    constructor(
            public readonly config: Config,
            public readonly logger: Logger,
            public readonly engine: Engine,
            public readonly provider: NearProvider) {
        super();
    }

    async eth_accounts(): Promise<api.Data[]> {
        return (await this.engine.keyStore.getSigningAddresses()).map(a => a.toString());
    }

    async eth_blockNumber(): Promise<api.Quantity> {
        const height = (await this.engine.getBlockHeight()).unwrap();
        return `0x${height.toString(16)}`;
    }

    async eth_call(transaction: api.TransactionForCall, blockNumber?: api.Quantity | api.Tag): Promise<api.Data> {
        return await (this.provider as any).routeRPC('eth_call', [transaction, blockNumber]); // TODO
    }

    async eth_chainId(): Promise<api.Quantity> { // EIP-695
        const chainID = (await this.engine.getChainID()).unwrap();
        return `0x${chainID.toString(16)}`;
    }

    async eth_coinbase(): Promise<api.Data> {
        return (await this.engine.getCoinbase()).unwrap().toString();
    }

    async eth_getBalance(address: api.Data, blockNumber?: api.Quantity | api.Tag): Promise<api.Quantity> {
        const address_ = Address.parse(address).unwrap();
        const balance = (await this.engine.getBalance(address_)).unwrap();
        return `0x${balance.toString(16)}`;
    }

    async eth_getBlockByHash(blockHash: api.Data, fullObject?: boolean): Promise<api.BlockResult | null> {
        const blockHash_ = blockHash.startsWith('0x') ? hexToBase58(blockHash) : blockHash;
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

    async eth_getBlockByNumber(blockNumber: api.Quantity | api.Tag, fullObject?: boolean): Promise<api.BlockResult | null> {
        const blockNumber_ = blockNumber.startsWith('0x') ? parseInt(blockNumber, 16) : blockNumber;
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

    async eth_getBlockTransactionCountByHash(blockHash: api.Data): Promise<api.Quantity | null> {
        const blockHash_ = blockHash.startsWith('0x') ? hexToBase58(blockHash) : blockHash;
        const result = await this.engine.getBlockTransactionCount(blockHash_);
        if (result.isErr()) return null;
        return `0x${result.unwrap().toString(16)}`;
    }

    async eth_getBlockTransactionCountByNumber(blockNumber: api.Quantity | api.Tag): Promise<api.Quantity | null> {
        const blockNumber_ = blockNumber.startsWith('0x') ? parseInt(blockNumber, 16) : blockNumber;
        const result = await this.engine.getBlockTransactionCount(blockNumber_);
        if (result.isErr()) return null;
        return `0x${result.unwrap().toString(16)}`;
    }

    async eth_getCode(address: api.Data, _blockNumber: api.Quantity | api.Tag): Promise<api.Data> {
        const address_ = Address.parse(address).unwrap();
        const code = (await this.engine.getCode(address_)).unwrap();
        return `0x${Buffer.from(code).toString('hex')}`;
    }

    async eth_getFilterChanges(filterID: api.Quantity): Promise<api.LogObject[]> {
        const filterID_ = parseInt(filterID, 16);
        if (filterID_ === 0) {
            return [];
        }
        unimplemented('eth_getFilterChanges'); // TODO
        return [];
    }

    async eth_getFilterLogs(filterID: api.Quantity): Promise<api.LogObject[]> {
        const filterID_ = parseInt(filterID, 16);
        if (filterID_ === 0) {
            return [];
        }
        unimplemented('eth_getFilterLogs'); // TODO
        return [];
    }

    async eth_getLogs(_filter: api.FilterOptions): Promise<api.LogObject[]> {
        unimplemented('eth_getLogs'); // TODO
        return [];
    }

    async eth_getStorageAt(address: api.Data, key: api.Quantity, blockNumber: api.Quantity | api.Tag): Promise<api.Data> {
        const address_ = Address.parse(address).unwrap();
        const result = (await this.engine.getStorageAt(address_, key)).unwrap();
        return formatU256(result);
    }

    async eth_getTransactionByBlockHashAndIndex(blockHash: api.Data, transactionIndex: api.Quantity): Promise<api.TransactionResult | null> {
        const blockHash_ = blockHash.startsWith('0x') ? hexToBase58(blockHash) : blockHash;
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

    async eth_getTransactionByBlockNumberAndIndex(blockNumber: api.Quantity | api.Tag, transactionIndex: api.Quantity): Promise<api.TransactionResult | null> {
        const blockNumber_ = blockNumber.startsWith('0x') ? parseInt(blockNumber, 16) : blockNumber;
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

    async eth_getTransactionByHash(transactionHash: api.Data): Promise<api.TransactionResult | null> {
        const transactionHash_ = hexToBytes(transactionHash);
        console.debug(transactionHash_); // TODO
        return await (this.provider as any).routeRPC('eth_getTransactionByHash', [transactionHash]); // TODO
    }

    async eth_getTransactionCount(address: api.Data, _blockNumber: api.Quantity | api.Tag): Promise<api.Quantity> {
        //const [address] = expectArgs(params, 1, 2, "cannot request transaction count without specifying address");
        const address_ = Address.parse(address).unwrap();
        const nonce = (await this.engine.getNonce(address_)).unwrap();
        return `0x${nonce.toString(16)}`;
    }

    async eth_getTransactionReceipt(transactionHash: string): Promise<api.TransactionReceipt | null> {
        return await (this.provider as any).routeRPC('eth_getapi.TransactionReceipt', [transactionHash]); // TODO
    }

    async eth_getUncleCountByBlockHash(blockHash: api.Data): Promise<api.Quantity | null> {
        const blockHash_ = blockHash.startsWith('0x') ? hexToBase58(blockHash) : blockHash;
        const result = await this.engine.hasBlock(blockHash_);
        return result && result.isOk() ? '0x0' : null;
    }

    async eth_getUncleCountByBlockNumber(blockNumber: api.Quantity | api.Tag): Promise<api.Quantity | null> {
        const blockNumber_ = blockNumber.startsWith('0x') ? parseInt(blockNumber, 16) : blockNumber;
        const result = await this.engine.hasBlock(blockNumber_);
        return result && result.isOk() ? '0x0' : null;
    }

    async eth_newBlockFilter(): Promise<api.Quantity> {
        unimplemented('eth_newBlockFilter'); // TODO
        return `0x0`;
    }

    async eth_newFilter(_filter: api.FilterOptions): Promise<api.Quantity> {
        unimplemented('eth_newFilter'); // TODO
        return `0x0`;
    }

    async eth_newPendingTransactionFilter(): Promise<api.Quantity> {
        return '0x0'; // designates the empty filter
    }

    async eth_sendRawTransaction(transaction: api.Data): Promise<api.Data> {
        const output = (await this.engine.rawCall(transaction)).unwrap();
        return `0x${output ? Buffer.from(output).toString('hex') : ''}`;
    }

    async eth_sendTransaction(transaction: api.TransactionForSend): Promise<api.Data> {
        return await (this.provider as any).routeRPC('eth_sendTransaction', [transaction]); // TODO
    }

    async eth_sign(_account: api.Data, _message: api.Data): Promise<api.Data> {
        unimplemented('eth_sign'); // TODO
        return `0x`;
    }

    async eth_signTransaction(_transaction: api.TransactionForSend): Promise<api.Data> {
        unimplemented('eth_signTransaction'); // TODO
        return `0x`;
    }

    async eth_signTypedData(_address: api.Data, _data: api.TypedData): Promise<api.Data> { // EIP-712
        unimplemented('eth_signTypedData'); // TODO
        return `0x`;
    }

    async eth_uninstallFilter(filterID: api.Quantity): Promise<boolean> {
        const filterID_ = parseInt(filterID, 16);
        if (filterID_ === 0) {
            return true;
        }
        unimplemented('eth_uninstallFilter'); // TODO
        return false;
    }
}
