import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { exit } from 'process';
import nearProvider from 'near-web3-provider';
import { validateEIP712, encodeMetaCall } from './eip-712-helpers';

function response(id, result, error) {
    let resp = {
        jsonrpc: "2.0",
        id,
    };
    if (result) {
        Object.assign(resp, { result });
    } else {
        Object.assign(resp, { error });
    }
    return resp;
}

export function createApp(argv, provider) {
    const app = express()
    app.use(bodyParser.json({ type: 'application/json' }));
    app.use(cors());

    app.post('/', async (req, res) => {
        res.header('Content-Type', 'application/json');
        const data = req.body;
        // TODO: validate data input is correct JSON RPC.
        try {
            const result = await provider.routeRPC(data.method, data.params);
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
            let result = await nearProvider.utils.rawFunctionCall(
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
