import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import nearProvider from 'near-web3-provider';
import yargs from 'yargs';
import { exit } from 'process';
import { validateEIP712, encodeMetaCall } from './eip-712-helpers';

const argv = yargs
  .command('network', 'Network')
  .default('network', 'betanet')
  .command('port', 'Port')
  .default('port', 8545)
  .boolean('noisy')
  .default('noisy', false)
  .boolean('fail-hard')
  .default('fail-hard', false)
  .argv;

const NETWORKS = {
  local: {
    nodeUrl: 'http://localhost:3030',
    networkId: 'local',
    evmAccountId: 'evm',
    masterAccountId: 'test.near',
    keyPath: '~/.near/local/validator_key.json',
  },
  betanet: {
    nodeUrl: 'https://rpc.betanet.near.org',
    networkId: 'betanet',
    evmAccountId: 'evm',
    masterAccountId: process.env.NEAR_MASTER_ACCOUNT,
  }
};

const provider = new nearProvider.NearProvider(NETWORKS[argv.network]);

const app = express()
app.use(bodyParser.json({ type: 'application/json' }));
app.use(cors());

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
      console.log(data, req.params);
      console.log(data, error);
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
  if (!validateEIP712(data.data, data.signature)) {
    res.send({code: -32000, message: "Signature is invalid for given message"});
    return;
  }
  try {
    let result = await nearProvider.utils.rawFunctionCall(
      provider.accountId,
      provider.evm_contract,
      'meta_call',
      encodeMetaCall(data.data, data.signature),
      '10000000000000',
      '0'
    );
    if (argv.noisy) {
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

app.listen(argv.port, () => {
  console.log(`NEAR EVM JSON RPC Proxy for ${argv.network} network listening at http://localhost:${argv.port}`)
});
