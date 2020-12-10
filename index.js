const express = require('express')
var bodyParser = require('body-parser')
const { NearProvider } = require('near-web3-provider');
const app = express()
const port = 3000

const provider = new NearProvider({
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
    resp.result = result;
  } else {
    resp.error = error;
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
    res.send(response(data.id, null, error));
  }
})

app.listen(port, () => {
  console.log(`NEAR EVM JSON RPC Proxy listening at http://localhost:${port}`)
});
