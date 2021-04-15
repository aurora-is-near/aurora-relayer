import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { exit } from 'process';
import nearProvider from 'near-web3-provider';
import { validateEIP712, encodeMetaCall } from './eip-712-helpers.js';

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

function response(id: string, result: any, error: any) {
    const resp = { jsonrpc: '2.0', id };
    if (result) {
        Object.assign(resp, { result });
    } else {
        Object.assign(resp, { error });
    }
    return resp;
}

export function createApp(argv: any, provider: NearProvider) {
    const app = express()
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
        } catch (error) {
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
            const result = await nearProvider.utils.rawFunctionCall(
                provider.account,
                provider.evm_contract,
                'meta_call',
                encodeMetaCall(data.data, data.signature),
                '10000000000000',
                '0'
            );
            if (argv.noisy) {
                console.log(data.data, data.signature);
                console.log(result);
            }
            res.send(response(data.id, result, null));
        } catch (error) {
            res.send(response(data.id, null, {
                code: -32000,
                message: error.message,
            }));
        }
    });

    return app;
}

export async function routeRPC(provider: NearProvider, method: string, params: any[]): Promise<any> {
    switch (method) {
        case 'web3_clientVersion': break;
        case 'web3_sha3': break;
        case 'net_version': break;
        case 'net_peerCount': break;
        case 'net_listening': break;
        case 'eth_protocolVersion': break;
        case 'eth_syncing': break;
        case 'eth_coinbase': break;
        case 'eth_chainId': break;
        case 'eth_mining': break;
        case 'eth_hashrate': break;
        case 'eth_gasPrice': break;
        case 'eth_accounts': break;
        case 'eth_blockNumber': break;
        case 'eth_getBalance': break;
        case 'eth_getStorageAt': break;
        case 'eth_getTransactionCount': break;
        case 'eth_getBlockTransactionCountByHash': break;
        case 'eth_getBlockTransactionCountByNumber': break;
        case 'eth_getUncleCountByBlockHash': break;
        case 'eth_getUncleCountByBlockNumber': break;
        case 'eth_getCode': break;
        case 'eth_sign': break;
        case 'eth_signTransaction': break;
        case 'eth_sendTransaction': break;
        case 'eth_sendRawTransaction': break;
        case 'eth_call': break;
        case 'eth_estimateGas': break;
        case 'eth_getBlockByHash': break;
        case 'eth_getBlockByNumber': break;
        case 'eth_getTransactionByHash': break;
        case 'eth_getTransactionByBlockHashAndIndex': break;
        case 'eth_getTransactionByBlockNumberAndIndex': break;
        case 'eth_getTransactionReceipt': break;
        case 'eth_pendingTransactions': break;
        case 'eth_getUncleByBlockHashAndIndex': break;
        case 'eth_getUncleByBlockNumberAndIndex': break;
        case 'eth_getCompilers': break;
        case 'eth_compileLLL': break;
        case 'eth_compileSolidity': break;
        case 'eth_compileSerpent': break;
        case 'eth_newFilter': break;
        case 'eth_newBlockFilter': break
        case 'eth_newPendingTransactionFilter': break;
        case 'eth_uninstallFilter': break;
        case 'eth_getFilterChanges': break;
        case 'eth_getFilterLogs': break;
        case 'eth_getLogs': break;
        case 'eth_getWork': break;
        case 'eth_submitWork': break;
        case 'eth_submitHashrate': break;
        case 'eth_signTypedData': break; // EIP-712
        case 'eth_getProof': break; // EIP-1186
        case 'near_retrieveNear': break;
        case 'near_transferNear': break;
    }
    return await (provider as any).routeRPC(method, params);
}
