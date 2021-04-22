/* This is free and unencumbered software released into the public domain. */

import { unimplemented, unsupported } from './errors.js';

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
    dummy: string;
}

export class Server {
    constructor(
        public readonly engine: Engine,
        public readonly provider: NearProvider,
        public readonly options: ServerOptions) {}

    // web3_*

    web3_clientVersion(): string {
        //expectArgs(params, 0, 0);
        return 'Aurora-Relayer/0.0.0'; // TODO
    }

    web3_sha3(input: string): string {
        //const [input] = expectArgs(params, 1, 1);
        return `0x${Buffer.from(keccakFromHexString(input)).toString('hex')}`;
    }

    // net_*

    net_listening(): boolean {
        //expectArgs(params, 0, 0);
        return true;
    }

    net_peerCount(): string {
        //expectArgs(params, 0, 0);
        return '0x0';
    }

    async net_version(): Promise<string> {
        //expectArgs(params, 0, 0);
        const chainID = (await this.engine.getChainID()).unwrap();
        return `0x${chainID.toString(16)}`;
    }

    // eth_*

    async eth_accounts(): Promise<Address[]> {
        //expectArgs(params, 0, 0);
        return await this.engine.keyStore.getSigningAddresses();
    }

    async eth_blockNumber(): Promise<string> {
        //expectArgs(params, 0, 0);
        const height = (await this.engine.getBlockHeight()).unwrap();
        return `0x${height.toString(16)}`;
    }

    async eth_call(...args: any[]): Promise<any> {
        return await (this.provider as any).routeRPC('eth_call', args); // TODO
    }

    async eth_chainId(): Promise<string> { // EIP-695
        //expectArgs(params, 0, 0);
        const chainID = (await this.engine.getChainID()).unwrap();
        return `0x${chainID.toString(16)}`;
    }

    async eth_coinbase() {
        //expectArgs(params, 0, 0);
        return (await this.engine.getCoinbase()).unwrap();
    }

    eth_compileLLL() {
        unsupported('eth_compileLLL');
    }

    eth_compileSerpent() {
        unsupported('eth_compileSerpent');
    }

    eth_compileSolidity() {
        unsupported('eth_compileSolidity');
    }

    eth_estimateGas(_1: any, ..._args: any[]): string {
        //expectArgs(params, 1, 2);
        return '0x0';
    }

    eth_gasPrice(): string {
        //expectArgs(params, 0, 0);
        return '0x0';
    }

    async eth_getBalance(address: any, ..._args: any[]): Promise<string> {
        //const [address] = expectArgs(params, 1, 2);
        const balance = (await this.engine.getBalance(address)).unwrap();
        return `0x${balance.toString(16)}`;
    }

    async eth_getBlockByHash(blockID: string, ...args: any[]): Promise<any | null> {
        //const [blockID, fullObject] = expectArgs(params, 1, 2);
        const [fullObject] = args;
        const blockHash = blockID.startsWith('0x') ? hexToBase58(blockID) : blockID;
        const options: BlockOptions = {
            contractID: this.engine.contractID,
            transactions: fullObject ? 'full' : 'id',
        };
        const result = await this.engine.getBlock(blockHash, options);
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

    async eth_getBlockByNumber(blockID: string, ...args: any[]): Promise<any | null> {
        //const [blockID, fullObject] = expectArgs(params, 1, 2);
        const [fullObject] = args;
        const blockHeight = blockID.startsWith('0x') ? parseInt(blockID, 16) : blockID;
        const options: BlockOptions = {
            contractID: this.engine.contractID,
            transactions: fullObject ? 'full' : 'id',
        };
        const result = await this.engine.getBlock(blockHeight, options);
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

    async eth_getBlockTransactionCountByHash(blockID: string): Promise<string | null> {
        //const [blockID] = expectArgs(params, 1, 1);
        const blockHash = blockID.startsWith('0x') ? hexToBase58(blockID) : blockID;
        const result = await this.engine.getBlockTransactionCount(blockHash);
        if (result.isErr()) return null;
        return `0x${result.unwrap().toString(16)}`;
    }

    async eth_getBlockTransactionCountByNumber(blockID: string): Promise<string | null> {
        //const [blockID] = expectArgs(params, 1, 1);
        const blockHeight = blockID.startsWith('0x') ? parseInt(blockID, 16) : blockID;
        const result = await this.engine.getBlockTransactionCount(blockHeight);
        if (result.isErr()) return null;
        return `0x${result.unwrap().toString(16)}`;
    }

    async eth_getCode(address: any, ..._args: any[]): Promise<string> {
        //const [address] = expectArgs(params, 1, 2);
        const code = (await this.engine.getCode(address)).unwrap();
        return `0x${Buffer.from(code).toString('hex')}`;
    }

    eth_getCompilers(): any[] {
        //expectArgs(params, 0, 0);
        return [];
    }

    eth_getFilterChanges() {
        unimplemented('eth_getFilterChanges'); // TODO
    }

    eth_getFilterLogs() {
        unimplemented('eth_getFilterLogs'); // TODO
    }

    async eth_getLogs(...args: any[]): Promise<any> {
        return await (this.provider as any).routeRPC('eth_getLogs', args); // TODO
    }

    eth_getProof() {
        unsupported('eth_getProof'); // EIP-1186 TODO?
    }

    async eth_getStorageAt(address: any, ...args: any[]): Promise<string> {
        //const [address, key] = expectArgs(params, 1, 3);
        const [key] = args;
        const result = (await this.engine.getStorageAt(address, key)).unwrap();
        return formatU256(result);
    }

    async eth_getTransactionByBlockHashAndIndex(blockID: string, transactionIdx: string): Promise<string | null> {
        //const [blockID, transactionIdx] = expectArgs(params, 2, 2);
        const blockHash = blockID.startsWith('0x') ? hexToBase58(blockID) : blockID;
        const transactionIndex = parseInt(transactionIdx, 16);
        const options: BlockOptions = {
            contractID: this.engine.contractID,
            transactions: 'full',
        };
        const result = await this.engine.getBlock(blockHash, options);
        if (result.isErr()) return null;
        const block = result.unwrap();
        let transaction = block.toJSON().transactions[transactionIndex];
        if (transaction) {
            transaction = Object.assign(transaction, {
                blockHash: block.hash,
                blockNumber: intToHex(block.number),
                transactionIndex: intToHex(transactionIndex),
            });
        }
        return transaction || null;
    }

    async eth_getTransactionByBlockNumberAndIndex(blockID: string, transactionIdx: string): Promise<string | null> {
        //const [blockID, transactionIdx] = expectArgs(params, 2, 2);
        const blockHeight = blockID.startsWith('0x') ? parseInt(blockID, 16) : blockID;
        const transactionIndex = parseInt(transactionIdx, 16);
        const options: BlockOptions = {
            contractID: this.engine.contractID,
            transactions: 'full',
        };
        const result = await this.engine.getBlock(blockHeight, options);
        if (result.isErr()) return null;
        const block = result.unwrap();
        let transaction = block.toJSON().transactions[transactionIndex];
        if (transaction) {
            transaction = Object.assign(transaction, {
                blockHash: block.hash,
                blockNumber: intToHex(block.number),
                transactionIndex: intToHex(transactionIndex),
            });
        }
        return transaction || null;
    }

    async eth_getTransactionByHash(...args: any[]): Promise<any> {
        return await (this.provider as any).routeRPC('eth_getTransactionByHash', args); // TODO
    }

    async eth_getTransactionCount(address: any): Promise<string> {
        //const [address] = expectArgs(params, 1, 2, "cannot request transaction count without specifying address");
        const nonce = (await this.engine.getNonce(address)).unwrap();
        return `0x${nonce.toString(16)}`;
    }

    async eth_getTransactionReceipt(...args: any[]): Promise<any> {
        return await (this.provider as any).routeRPC('eth_getTransactionReceipt', args); // TODO
    }

    eth_getUncleByBlockHashAndIndex(): null {
        //expectArgs(params, 2, 2);
        return null; // uncle blocks are never found
    }

    eth_getUncleByBlockNumberAndIndex(): null {
        //expectArgs(params, 2, 2);
        return null; // uncle blocks are never found
    }

    async eth_getUncleCountByBlockHash(blockID: string): Promise<string | null> {
        //const [blockID] = expectArgs(params, 1, 1);
        const blockHash = blockID.startsWith('0x') ? hexToBase58(blockID) : blockID;
        const result = await this.engine.hasBlock(blockHash);
        return result && result.isOk() ? '0x0' : null;
    }

    async eth_getUncleCountByBlockNumber(blockID: string): Promise<string | null> {
        //const [blockID] = expectArgs(params, 1, 1);
        const blockHeight = blockID.startsWith('0x') ? parseInt(blockID, 16) : blockID;
        const result = await this.engine.hasBlock(blockHeight);
        return result && result.isOk() ? '0x0' : null;
    }

    eth_getWork() {
        unsupported('eth_getWork');
    }

    eth_hashrate(): string {
        //expectArgs(params, 0, 0);
        return '0x0';
    }

    eth_mining(): boolean {
        //expectArgs(params, 0, 0);
        return false;
    }

    eth_newBlockFilter() {
        unimplemented('eth_newBlockFilter'); // TODO
    }

    eth_newFilter() {
        unimplemented('eth_newFilter'); // TODO
    }

    eth_newPendingTransactionFilter() {
        unimplemented('eth_newPendingTransactionFilter'); // TODO
    }

    eth_pendingTransactions(): any[] {
        //expectArgs(params, 0, 0);
        return [];
    }

    eth_protocolVersion(): string {
        //expectArgs(params, 0, 0);
        return '0x41';
    }

    async eth_sendRawTransaction(...args: any[]): Promise<any> {
        return await (this.provider as any).routeRPC('eth_sendRawTransaction', args); // TODO
    }

    async eth_sendTransaction(...args: any[]): Promise<any> {
        return await (this.provider as any).routeRPC('eth_sendTransaction', args); // TODO
    }

    eth_sign() {
        unimplemented('eth_sign'); // TODO
    }

    eth_signTransaction() {
        unimplemented('eth_signTransaction'); // TODO
    }

    eth_signTypedData() {
        return null; // EIP-712 TODO
    }

    eth_submitHashrate() {
        unsupported('eth_submitHashrate');
    }

    eth_submitWork() {
        unsupported('eth_submitWork');
    }

    eth_syncing(): boolean {
        //expectArgs(params, 0, 0);
        return false;
    }

    eth_uninstallFilter() {
        unimplemented('eth_uninstallFilter'); // TODO
    }
}
