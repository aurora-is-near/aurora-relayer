import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { exit } from 'process';
import nearProvider from 'near-web3-provider';
import { validateEIP712, encodeMetaCall } from './eip-712-helpers.js';
import { keccakFromHexString } from 'ethereumjs-util';
import { Engine, formatU256 } from '@aurora-is-near/engine';
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
export function createApp(argv, provider) {
    const app = express();
    app.use(bodyParser.json({ type: 'application/json' }));
    app.use(cors());
    app.post('/', async (req, res) => {
        res.header('Content-Type', 'application/json');
        const data = req.body;
        // TODO: validate data input is correct JSON RPC.
        try {
            const result = await routeRPC(provider, data.method, data.params);
            if (argv.noisy) {
                console.log(data, req.params);
                console.log(result);
            }
            res.send(response(data.id, result, null));
        }
        catch (error) {
            if (argv.failHard || argv.noisy) {
                console.error(data, req.params);
                console.error(data, error);
            }
            if (argv.failHard) {
                exit(0);
            }
            // TODO: return errors that match errors from Ethereum nodes.
            res.send(response(data.id, null, {
                code: -32000,
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
            if (argv.noisy) {
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
function unsupported() {
    throw new Error("unsupported");
}
function unimplemented() {
    throw new Error("unimplemented");
}
export async function routeRPC(provider, method, params) {
    const engine = await Engine.connect({});
    switch (method) {
        case 'web3_clientVersion': return 'Aurora-Relayer';
        case 'web3_sha3': return `0x${Buffer.from(keccakFromHexString(params[0])).toString('hex')}`;
        case 'net_version': return '1';
        case 'net_peerCount': return '0x0';
        case 'net_listening': return false;
        case 'eth_accounts': break; // TODO
        case 'eth_blockNumber': {
            const chainID = (await engine.getBlockHeight()).unwrap();
            return `0x${chainID.toString(16)}`;
        }
        case 'eth_call': break; // TODO
        case 'eth_chainId': { // EIP-695
            return (await engine.getChainID()).unwrap().toString();
        }
        case 'eth_coinbase': {
            return (await engine.getCoinbase()).unwrap();
        }
        case 'eth_compileLLL': return unsupported();
        case 'eth_compileSerpent': return unsupported();
        case 'eth_compileSolidity': return unsupported();
        case 'eth_estimateGas': break; // TODO
        case 'eth_gasPrice': return '0x0';
        case 'eth_getBalance': {
            const balance = (await engine.getBalance(params[0])).unwrap();
            return `0x${balance.toString(16)}`;
        }
        case 'eth_getBlockByHash': break; // TODO
        case 'eth_getBlockByNumber': break; // TODO
        case 'eth_getBlockTransactionCountByHash': break; // TODO
        case 'eth_getBlockTransactionCountByNumber': break; // TODO
        case 'eth_getCode': {
            const code = (await engine.getCode(params[0])).unwrap();
            return `0x${Buffer.from(code).toString('hex')}`;
        }
        case 'eth_getCompilers': return [];
        case 'eth_getFilterChanges': break; // TODO
        case 'eth_getFilterLogs': break; // TODO
        case 'eth_getLogs': break; // TODO
        case 'eth_getProof': break; // EIP-1186 TODO
        case 'eth_getStorageAt': {
            const result = (await engine.getStorageAt(params[0], params[1])).unwrap();
            return formatU256(result);
        }
        case 'eth_getTransactionByBlockHashAndIndex': break; // TODO
        case 'eth_getTransactionByBlockNumberAndIndex': break; // TODO
        case 'eth_getTransactionByHash': break; // TODO
        case 'eth_getTransactionCount': {
            const nonce = (await engine.getNonce(params[0])).unwrap();
            return formatU256(nonce);
        }
        case 'eth_getTransactionReceipt': break; // TODO
        case 'eth_getUncleByBlockHashAndIndex': break; // TODO
        case 'eth_getUncleByBlockNumberAndIndex': break; // TODO
        case 'eth_getUncleCountByBlockHash': return '0x0';
        case 'eth_getUncleCountByBlockNumber': return '0x0';
        case 'eth_getWork': return unsupported();
        case 'eth_hashrate': return '0x0';
        case 'eth_mining': return false;
        case 'eth_newBlockFilter': return unimplemented(); // TODO
        case 'eth_newFilter': return unimplemented(); // TODO
        case 'eth_newPendingTransactionFilter': return unimplemented(); // TODO
        case 'eth_pendingTransactions': break; // TODO
        case 'eth_protocolVersion': return '1'; // FIXME
        case 'eth_sendRawTransaction': break; // TODO
        case 'eth_sendTransaction': break; // TODO
        case 'eth_sign': break; // TODO
        case 'eth_signTransaction': break; // TODO
        case 'eth_signTypedData': break; // EIP-712 TODO
        case 'eth_submitHashrate': return unsupported();
        case 'eth_submitWork': return unsupported();
        case 'eth_syncing': return false;
        case 'eth_uninstallFilter': return unimplemented();
        case 'near_retrieveNear': break;
        case 'near_transferNear': break;
        default: return unsupported();
    }
    return await provider.routeRPC(method, params);
}
