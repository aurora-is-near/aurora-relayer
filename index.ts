import express from 'express';
import bodyParser from 'body-parser';
import nearProvider from 'near-web3-provider';

const app = express()
const port = 8545

const provider = new nearProvider.NearProvider({
  nodeUrl: 'http://rpc.betanet.near.org',
  networkId: 'betanet',
  evmAccountId: 'evm',
  masterAccountId: 'testevm1.betanet',
});

app.use(bodyParser.json({ type: 'application/json' }));

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

app.listen(port, () => {
  console.log(`NEAR EVM JSON RPC Proxy listening at http://localhost:${port}`)
});
