import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { exit } from 'process';
import nearProvider from 'near-web3-provider';
import { validateEIP712, encodeMetaCall } from './eip-712-helpers.js';
import { keccakFromHexString } from 'ethereumjs-util';
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
    switch (method) {
        case 'web3_clientVersion': return 'Aurora-Relayer';
        case 'web3_sha3': return `0x${Buffer.from(keccakFromHexString(params[0])).toString('hex')}`;
        case 'net_version': return '1';
        case 'net_peerCount': return '0x0';
        case 'net_listening': return false;
        case 'eth_accounts': return [];
        case 'eth_blockNumber': return '0x0'; // TODO
        case 'eth_call': break;
        case 'eth_chainId': return '0x1'; // EIP-695 FIXME
        case 'eth_coinbase': return '0x0000000000000000000000000000000000000000';
        case 'eth_compileLLL': return unsupported();
        case 'eth_compileSerpent': return unsupported();
        case 'eth_compileSolidity': return unsupported();
        case 'eth_estimateGas': break;
        case 'eth_gasPrice': return '0x0';
        case 'eth_getBalance': break;
        case 'eth_getBlockByHash': break;
        case 'eth_getBlockByNumber': break;
        case 'eth_getBlockTransactionCountByHash': break;
        case 'eth_getBlockTransactionCountByNumber': break;
        case 'eth_getCode': break;
        case 'eth_getCompilers': return [];
        case 'eth_getFilterChanges': break;
        case 'eth_getFilterLogs': break;
        case 'eth_getLogs': break;
        case 'eth_getProof': break; // EIP-1186
        case 'eth_getStorageAt': break;
        case 'eth_getTransactionByBlockHashAndIndex': break;
        case 'eth_getTransactionByBlockNumberAndIndex': break;
        case 'eth_getTransactionByHash': break;
        case 'eth_getTransactionCount': return '0x0'; // TODO
        case 'eth_getTransactionReceipt': break;
        case 'eth_getUncleByBlockHashAndIndex': break;
        case 'eth_getUncleByBlockNumberAndIndex': break;
        case 'eth_getUncleCountByBlockHash': return '0x';
        case 'eth_getUncleCountByBlockNumber': return '0x';
        case 'eth_getWork': return unsupported();
        case 'eth_hashrate': return '0x0';
        case 'eth_mining': return false;
        case 'eth_newBlockFilter': return unimplemented();
        case 'eth_newFilter': return unimplemented();
        case 'eth_newPendingTransactionFilter': return unimplemented();
        case 'eth_pendingTransactions': break;
        case 'eth_protocolVersion': return '1'; // FIXME
        case 'eth_sendRawTransaction': break;
        case 'eth_sendTransaction': break;
        case 'eth_sign': break;
        case 'eth_signTransaction': break;
        case 'eth_signTypedData': break; // EIP-712
        case 'eth_submitHashrate': return unsupported();
        case 'eth_submitWork': return unsupported();
        case 'eth_syncing': return false;
        case 'eth_uninstallFilter': return unimplemented();
        case 'near_retrieveNear': break;
        case 'near_transferNear': break;
    }
    return await provider.routeRPC(method, params);
}
