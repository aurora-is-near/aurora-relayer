/* This is free and unencumbered software released into the public domain. */
import { validateEIP712, encodeMetaCall } from './eip-712-helpers.js';
import * as errors from './errors.js';
import { expectArgs, unsupported, unimplemented } from './errors.js';
import { formatU256, hexToBase58, intToHex } from '@aurora-is-near/engine';
import bodyParser from 'body-parser';
import cors from 'cors';
import { keccakFromHexString } from 'ethereumjs-util';
import express from 'express';
import expressRateLimit from 'express-rate-limit';
import nearProvider from 'near-web3-provider';
function response(id, result, error) {
    const resp = { jsonrpc: '2.0', id };
    if (error) {
        Object.assign(resp, { error });
    }
    else {
        Object.assign(resp, { result });
    }
    return resp;
}
function errorCode(error) {
    if (error instanceof errors.CodedError) {
        return error.code;
    }
    return -32000;
}
export async function createApp(options, engine, provider) {
    const app = express();
    app.use(bodyParser.json({ type: 'application/json' }));
    app.use(cors());
    app.use(expressRateLimit({
        windowMs: 60 * 1000,
        max: 2,
        headers: false,
        draft_polli_ratelimit_headers: true,
        handler: (req, res) => {
            res.status(429)
                .set('Content-Type', 'text/plain')
                .send("Too many requests, please try again later.");
        },
    }));
    app.post('/', async (req, res) => {
        res.header('Content-Type', 'application/json');
        const data = req.body;
        // TODO: validate data input is correct JSON RPC.
        try {
            const result = await routeRPC(provider, engine, data.method, data.params);
            if (options.debug) {
                console.log(data, req.params);
                console.log(result);
            }
            res.send(response(data.id, result, null));
        }
        catch (error) {
            if (options.debug) {
                console.error(data, req.params);
                console.error(data, error);
            }
            // if (argv.failHard) exit(0);
            res.send(response(data.id, null, {
                code: errorCode(error),
                message: error.message,
            }));
        }
    });
    app.post('/relay', async (req, res) => {
        res.header('Content-Type', 'application/json');
        const data = req.body;
        if (!data.data || !data.signature || !validateEIP712(data.data, data.signature)) {
            res.send({ code: -32000, message: "Signature is invalid for given message" });
            return;
        }
        try {
            const result = await nearProvider.utils.rawFunctionCall(provider.account, provider.evm_contract, 'meta_call', encodeMetaCall(data.data, data.signature), '10000000000000', '0');
            if (options.verbose) {
                console.log(data.data, data.signature);
                console.log(result);
            }
            res.send(response(data.id, result, null));
        }
        catch (error) {
            res.send(response(data.id, null, {
                code: -32000,
                message: error.message,
            }));
        }
    });
    return app;
}
export async function routeRPC(provider, engine, method, params) {
    //console.log(method, params); // DEBUG
    switch (method) {
        // web3_*
        case 'web3_clientVersion': {
            expectArgs(params, 0, 0);
            return 'Aurora-Relayer/0.0.0'; // TODO
        }
        case 'web3_sha3': {
            const [input] = expectArgs(params, 1, 1);
            return `0x${Buffer.from(keccakFromHexString(input)).toString('hex')}`;
        }
        // net_*
        case 'net_listening': {
            expectArgs(params, 0, 0);
            return true;
        }
        case 'net_peerCount': {
            expectArgs(params, 0, 0);
            return '0x0';
        }
        case 'net_version': {
            expectArgs(params, 0, 0);
            const chainID = (await engine.getChainID()).unwrap();
            return `0x${chainID.toString(16)}`;
        }
        // eth_*
        case 'eth_accounts': {
            expectArgs(params, 0, 0);
            return await engine.keyStore.getSigningAddresses();
        }
        case 'eth_blockNumber': {
            expectArgs(params, 0, 0);
            const height = (await engine.getBlockHeight()).unwrap();
            return `0x${height.toString(16)}`;
        }
        case 'eth_call': break; // TODO
        case 'eth_chainId': { // EIP-695
            expectArgs(params, 0, 0);
            const chainID = (await engine.getChainID()).unwrap();
            return `0x${chainID.toString(16)}`;
        }
        case 'eth_coinbase': {
            expectArgs(params, 0, 0);
            return (await engine.getCoinbase()).unwrap();
        }
        case 'eth_compileLLL': return unsupported(method);
        case 'eth_compileSerpent': return unsupported(method);
        case 'eth_compileSolidity': return unsupported(method);
        case 'eth_estimateGas': {
            expectArgs(params, 1, 2);
            return '0x0';
        }
        case 'eth_gasPrice': {
            expectArgs(params, 0, 0);
            return '0x0';
        }
        case 'eth_getBalance': {
            const [address] = expectArgs(params, 1, 2);
            const balance = (await engine.getBalance(address)).unwrap();
            return `0x${balance.toString(16)}`;
        }
        case 'eth_getBlockByHash': {
            const [blockID, fullObject] = expectArgs(params, 1, 2);
            const blockHash = blockID.startsWith('0x') ? hexToBase58(blockID) : blockID;
            const options = {
                contractID: engine.contractID,
                transactions: fullObject ? 'full' : 'id',
            };
            const result = await engine.getBlock(blockHash, options);
            if (result.isErr())
                return null;
            const block = result.unwrap();
            const response = block.toJSON();
            if (fullObject) {
                response.transactions.forEach((tx, i) => {
                    tx.blockHash = block.hash;
                    tx.blockNumber = intToHex(block.number);
                    tx.transactionIndex = intToHex(i);
                });
            }
            return response;
        }
        case 'eth_getBlockByNumber': {
            const [blockID, fullObject] = expectArgs(params, 1, 2);
            const blockHeight = blockID.startsWith('0x') ? parseInt(blockID, 16) : blockID;
            const options = {
                contractID: engine.contractID,
                transactions: fullObject ? 'full' : 'id',
            };
            const result = await engine.getBlock(blockHeight, options);
            if (result.isErr())
                return null;
            const block = result.unwrap();
            const response = block.toJSON();
            if (fullObject) {
                response.transactions.forEach((tx, i) => {
                    tx.blockHash = block.hash;
                    tx.blockNumber = intToHex(block.number);
                    tx.transactionIndex = intToHex(i);
                });
            }
            return response;
        }
        case 'eth_getBlockTransactionCountByHash': {
            const [blockID] = expectArgs(params, 1, 1);
            const blockHash = blockID.startsWith('0x') ? hexToBase58(blockID) : blockID;
            const result = await engine.getBlockTransactionCount(blockHash);
            if (result.isErr())
                return null;
            return `0x${result.unwrap().toString(16)}`;
        }
        case 'eth_getBlockTransactionCountByNumber': {
            const [blockID] = expectArgs(params, 1, 1);
            const blockHeight = blockID.startsWith('0x') ? parseInt(blockID, 16) : blockID;
            const result = await engine.getBlockTransactionCount(blockHeight);
            if (result.isErr())
                return null;
            return `0x${result.unwrap().toString(16)}`;
        }
        case 'eth_getCode': {
            const [address] = expectArgs(params, 1, 2);
            const code = (await engine.getCode(address)).unwrap();
            return `0x${Buffer.from(code).toString('hex')}`;
        }
        case 'eth_getCompilers': {
            expectArgs(params, 0, 0);
            return [];
        }
        case 'eth_getFilterChanges': return unimplemented(method); // TODO
        case 'eth_getFilterLogs': return unimplemented(method); // TODO
        case 'eth_getLogs': break; // TODO
        case 'eth_getProof': return unsupported(method); // EIP-1186 TODO?
        case 'eth_getStorageAt': {
            const [address, key] = expectArgs(params, 1, 3);
            const result = (await engine.getStorageAt(address, key)).unwrap();
            return formatU256(result);
        }
        case 'eth_getTransactionByBlockHashAndIndex': {
            const [blockID, transactionIdx] = expectArgs(params, 2, 2);
            const blockHash = blockID.startsWith('0x') ? hexToBase58(blockID) : blockID;
            const transactionIndex = parseInt(transactionIdx, 16);
            const options = {
                contractID: engine.contractID,
                transactions: 'full',
            };
            const result = await engine.getBlock(blockHash, options);
            if (result.isErr())
                return null;
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
        case 'eth_getTransactionByBlockNumberAndIndex': {
            const [blockID, transactionIdx] = expectArgs(params, 2, 2);
            const blockHeight = blockID.startsWith('0x') ? parseInt(blockID, 16) : blockID;
            const transactionIndex = parseInt(transactionIdx, 16);
            const options = {
                contractID: engine.contractID,
                transactions: 'full',
            };
            const result = await engine.getBlock(blockHeight, options);
            if (result.isErr())
                return null;
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
        case 'eth_getTransactionByHash': break; // TODO
        case 'eth_getTransactionCount': {
            const [address] = expectArgs(params, 1, 2, "cannot request transaction count without specifying address");
            const nonce = (await engine.getNonce(address)).unwrap();
            return `0x${nonce.toString(16)}`;
        }
        case 'eth_getTransactionReceipt': break; // TODO
        case 'eth_getUncleByBlockHashAndIndex': {
            expectArgs(params, 2, 2);
            return null; // uncle blocks are never found
        }
        case 'eth_getUncleByBlockNumberAndIndex': {
            expectArgs(params, 2, 2);
            return null; // uncle blocks are never found
        }
        case 'eth_getUncleCountByBlockHash': {
            const [blockID] = expectArgs(params, 1, 1);
            const blockHash = blockID.startsWith('0x') ? hexToBase58(blockID) : blockID;
            const result = await engine.hasBlock(blockHash);
            return result && result.isOk() ? '0x0' : null;
        }
        case 'eth_getUncleCountByBlockNumber': {
            const [blockID] = expectArgs(params, 1, 1);
            const blockHeight = blockID.startsWith('0x') ? parseInt(blockID, 16) : blockID;
            const result = await engine.hasBlock(blockHeight);
            return result && result.isOk() ? '0x0' : null;
        }
        case 'eth_getWork': return unsupported(method);
        case 'eth_hashrate': {
            expectArgs(params, 0, 0);
            return '0x0';
        }
        case 'eth_mining': {
            expectArgs(params, 0, 0);
            return false;
        }
        case 'eth_newBlockFilter': return unimplemented(method); // TODO
        case 'eth_newFilter': return unimplemented(method); // TODO
        case 'eth_newPendingTransactionFilter': return unimplemented(method); // TODO
        case 'eth_pendingTransactions': {
            expectArgs(params, 0, 0);
            return [];
        }
        case 'eth_protocolVersion': {
            expectArgs(params, 0, 0);
            return '0x41';
        }
        case 'eth_sendRawTransaction': break; // TODO
        case 'eth_sendTransaction': break; // TODO
        case 'eth_sign': return unimplemented(method); // TODO
        case 'eth_signTransaction': return unimplemented(method); // TODO
        case 'eth_signTypedData': break; // EIP-712 TODO
        case 'eth_submitHashrate': return unsupported(method);
        case 'eth_submitWork': return unsupported(method);
        case 'eth_syncing': {
            expectArgs(params, 0, 0);
            return false;
        }
        case 'eth_uninstallFilter': return unimplemented(method); // TODO
        // near_*
        case 'near_retrieveNear': break;
        case 'near_transferNear': break;
        // *
        default: return unsupported(method);
    }
    return await provider.routeRPC(method, params);
}
