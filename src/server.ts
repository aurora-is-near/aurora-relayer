/* This is free and unencumbered software released into the public domain. */

import { unimplemented, unsupported } from './errors.js';
import { BlockResult, Data, FilterOptions, LogObject, ProofResult, Quantity, Service, Tag, TransactionForCall, TransactionForSend, TransactionReceipt, TransactionResult, TypedData } from './service.js';

import { Address, BlockOptions, Engine, formatU256, hexToBase58, intToHex } from '@aurora-is-near/engine';
import { keccakFromHexString } from 'ethereumjs-util';

interface NearProvider {
    networkId: string;
    evm_contract: string;
    isReadOnly: boolean;
    url: string;
    version: string;
    nearProvider: any;
    keyStore: any;
    signer: any;
    connection: any;
    accountId: string;
    account: any;
    accountEvmAddress: string;
    accounts: Map<string, any>;
    walletUrl: string;
    explorerUrl: string;
}

interface ServerOptions {
    dummy: string; // TODO
}

export class Server implements Service {
    constructor(
        public readonly engine: Engine,
        public readonly provider: NearProvider,
        public readonly options: ServerOptions) {}

    // web3_*

    async web3_clientVersion(): Promise<string> {
        return 'Aurora-Relayer/0.0.0'; // TODO
    }

    async web3_sha3(input: Data): Promise<Data> {
        return `0x${Buffer.from(keccakFromHexString(input)).toString('hex')}`;
    }

    // net_*

    async net_listening(): Promise<boolean> {
        return true;
    }

    async net_peerCount(): Promise<Quantity> {
        return '0x0';
    }

    async net_version(): Promise<string> {
        const chainID = (await this.engine.getChainID()).unwrap();
        return `0x${chainID.toString(16)}`;
    }

    // eth_*

    async eth_accounts(): Promise<Data[]> {
        return (await this.engine.keyStore.getSigningAddresses()).map(a => a.toString());
    }

    async eth_blockNumber(): Promise<Quantity> {
        const height = (await this.engine.getBlockHeight()).unwrap();
        return `0x${height.toString(16)}`;
    }

    async eth_call(transaction: TransactionForCall, blockNumber?: Quantity | Tag): Promise<Data> {
        return await (this.provider as any).routeRPC('eth_call', [transaction, blockNumber]); // TODO
    }

    async eth_chainId(): Promise<Quantity> { // EIP-695
        const chainID = (await this.engine.getChainID()).unwrap();
        return `0x${chainID.toString(16)}`;
    }

    async eth_coinbase(): Promise<Data> {
        return (await this.engine.getCoinbase()).unwrap().toString();
    }

    async eth_compileLLL(_code: string): Promise<Data> {
        unsupported('eth_compileLLL');
        return '';
    }

    async eth_compileSerpent(_code: string): Promise<Data> {
        unsupported('eth_compileSerpent');
        return '';
    }

    async eth_compileSolidity(_code: string): Promise<Data> {
        unsupported('eth_compileSolidity');
        return '';
    }

    async eth_estimateGas(_transaction: TransactionForCall, _blockNumber?: Quantity | Tag): Promise<Quantity> {
        return '0x0';
    }

    async eth_gasPrice(): Promise<Quantity> {
        return '0x0';
    }

    async eth_getBalance(address: Data, blockNumber?: Quantity | Tag): Promise<Quantity> {
        const address_ = Address.parse(address).unwrap();
        const balance = (await this.engine.getBalance(address_)).unwrap();
        return `0x${balance.toString(16)}`;
    }

    async eth_getBlockByHash(blockHash: Data, fullObject?: boolean): Promise<BlockResult | null> {
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

    async eth_getBlockByNumber(blockNumber: Quantity | Tag, fullObject?: boolean): Promise<BlockResult | null> {
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

    async eth_getBlockTransactionCountByHash(blockHash: Data): Promise<Quantity | null> {
        const blockHash_ = blockHash.startsWith('0x') ? hexToBase58(blockHash) : blockHash;
        const result = await this.engine.getBlockTransactionCount(blockHash_);
        if (result.isErr()) return null;
        return `0x${result.unwrap().toString(16)}`;
    }

    async eth_getBlockTransactionCountByNumber(blockNumber: Quantity | Tag): Promise<Quantity | null> {
        const blockNumber_ = blockNumber.startsWith('0x') ? parseInt(blockNumber, 16) : blockNumber;
        const result = await this.engine.getBlockTransactionCount(blockNumber_);
        if (result.isErr()) return null;
        return `0x${result.unwrap().toString(16)}`;
    }

    async eth_getCode(address: Data, _blockNumber: Quantity | Tag): Promise<Data> {
        const address_ = Address.parse(address).unwrap();
        const code = (await this.engine.getCode(address_)).unwrap();
        return `0x${Buffer.from(code).toString('hex')}`;
    }

    async eth_getCompilers(): Promise<string[]> {
        return [];
    }

    async eth_getFilterChanges(_filterID: Quantity): Promise<LogObject[]> {
        unimplemented('eth_getFilterChanges'); // TODO
        return [];
    }

    async eth_getFilterLogs(_filterID: Quantity): Promise<LogObject[]> {
        unimplemented('eth_getFilterLogs'); // TODO
        return [];
    }

    async eth_getLogs(filter: FilterOptions): Promise<LogObject[]> {
        return await (this.provider as any).routeRPC('eth_getLogs', [filter]); // TODO
    }

    async eth_getProof(_address: Data, _keys: Data[], _blockNumber: Quantity | Tag): Promise<ProofResult> { // EIP-1186
        unsupported('eth_getProof'); // EIP-1186 TODO?
        return {};
    }

    async eth_getStorageAt(address: Data, key: Quantity, blockNumber: Quantity | Tag): Promise<Data> {
        const address_ = Address.parse(address).unwrap();
        const result = (await this.engine.getStorageAt(address_, key)).unwrap();
        return formatU256(result);
    }

    async eth_getTransactionByBlockHashAndIndex(blockHash: Data, transactionIndex: Quantity): Promise<TransactionResult | null> {
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

    async eth_getTransactionByBlockNumberAndIndex(blockNumber: Quantity | Tag, transactionIndex: Quantity): Promise<TransactionResult | null> {
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

    async eth_getTransactionByHash(transactionHash: Data): Promise<TransactionResult | null> {
        return await (this.provider as any).routeRPC('eth_getTransactionByHash', [transactionHash]); // TODO
    }

    async eth_getTransactionCount(address: Data, _blockNumber: Quantity | Tag): Promise<Quantity> {
        //const [address] = expectArgs(params, 1, 2, "cannot request transaction count without specifying address");
        const address_ = Address.parse(address).unwrap();
        const nonce = (await this.engine.getNonce(address_)).unwrap();
        return `0x${nonce.toString(16)}`;
    }

    async eth_getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt | null> {
        return await (this.provider as any).routeRPC('eth_getTransactionReceipt', [transactionHash]); // TODO
    }

    async eth_getUncleByBlockHashAndIndex(_blockHash: Data, _uncleIndex: Quantity): Promise<BlockResult | null> {
        return null; // uncle blocks are never found
    }

    async eth_getUncleByBlockNumberAndIndex(_blockNumber: Quantity | Tag, _uncleIndex: Quantity): Promise<BlockResult | null> {
        return null; // uncle blocks are never found
    }

    async eth_getUncleCountByBlockHash(blockHash: Data): Promise<Quantity | null> {
        const blockHash_ = blockHash.startsWith('0x') ? hexToBase58(blockHash) : blockHash;
        const result = await this.engine.hasBlock(blockHash_);
        return result && result.isOk() ? '0x0' : null;
    }

    async eth_getUncleCountByBlockNumber(blockNumber: Quantity | Tag): Promise<Quantity | null> {
        const blockNumber_ = blockNumber.startsWith('0x') ? parseInt(blockNumber, 16) : blockNumber;
        const result = await this.engine.hasBlock(blockNumber_);
        return result && result.isOk() ? '0x0' : null;
    }

    async eth_getWork(): Promise<Data[]> {
        unsupported('eth_getWork');
        return [];
    }

    async eth_hashrate(): Promise<Quantity> {
        return '0x0';
    }

    async eth_mining(): Promise<false> {
        return false;
    }

    async eth_newBlockFilter(): Promise<Quantity> {
        unimplemented('eth_newBlockFilter'); // TODO
        return `0x0`;
    }

    async eth_newFilter(_filter: FilterOptions): Promise<Quantity> {
        unimplemented('eth_newFilter'); // TODO
        return `0x0`;
    }

    async eth_newPendingTransactionFilter(): Promise<Quantity> {
        unimplemented('eth_newPendingTransactionFilter'); // TODO
        return `0x0`;
    }

    async eth_pendingTransactions(): Promise<Record<string, string | number | null>[]> { // undocumented
        return [];
    }

    async eth_protocolVersion(): Promise<string> {
        return '0x41';
    }

    async eth_sendRawTransaction(transaction: Data): Promise<Data> {
        return await (this.provider as any).routeRPC('eth_sendRawTransaction', [transaction]); // TODO
    }

    async eth_sendTransaction(transaction: TransactionForSend): Promise<Data> {
        return await (this.provider as any).routeRPC('eth_sendTransaction', [transaction]); // TODO
    }

    async eth_sign(_account: Data, _message: Data): Promise<Data> {
        unimplemented('eth_sign'); // TODO
        return `0x`;
    }

    async eth_signTransaction(_transaction: TransactionForSend): Promise<Data> {
        unimplemented('eth_signTransaction'); // TODO
        return `0x`;
    }

    async eth_signTypedData(_address: Data, _data: TypedData): Promise<Data> { // EIP-712
        unimplemented('eth_signTypedData'); // TODO
        return `0x`;
    }

    async eth_submitHashrate(_hashrate: Quantity, _clientID: Quantity): Promise<false> {
        unsupported('eth_submitHashrate');
        return false;
    }

    async eth_submitWork(_nonce: Data, _powHash: Data, _mixDigest: Data): Promise<false> {
        unsupported('eth_submitWork');
        return false;
    }

    async eth_syncing(): Promise<false> {
        return false;
    }

    async eth_uninstallFilter(_filterID: Quantity): Promise<boolean> {
        unimplemented('eth_uninstallFilter'); // TODO
        return false;
    }
}
