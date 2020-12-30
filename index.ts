import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import nearProvider from 'near-web3-provider';
import yargs from 'yargs';

const argv = yargs
  .command('network', 'Network')
  .default('network', 'betanet')
  .command('port', 'Port')
  .default('port', 8545)
  .argv;

const NETWORKS = {
  local: {
    nodeUrl: 'localhost:3030',
    networkId: 'local',
    evmAccountId: 'evm',
    masterAccountId: 'test.near',
  },
  betanet: {
    nodeUrl: 'http://rpc.betanet.near.org',
    networkId: 'betanet',
    evmAccountId: 'evm',
    masterAccountId: 'testevm1.betanet',
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
  console.log(data, req.params);
  try {
    const result = await provider.routeRPC(data.method, data.params);
    console.log(result);
    res.send(response(data.id, result, null));
  } catch (error) {
    console.log(error);
    // TODO: return errors that match errors from Ethereum nodes.
    res.send(response(data.id, null, {
      code: -32000,
      message: error.message,
    }));
  }
})

app.listen(argv.port, () => {
  console.log(`NEAR EVM JSON RPC Proxy for ${argv.network} network listening at http://localhost:${argv.port}`)
});
