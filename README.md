# Aurora Relayer

[![Project license](https://img.shields.io/badge/License-Public%20Domain-blue.svg)](https://creativecommons.org/publicdomain/zero/1.0/)
[![Discord](https://img.shields.io/discord/490367152054992913?label=Discord)](https://discord.gg/jNjHYUF8vw)
[![Lints](https://github.com/aurora-is-near/aurora-relayer/actions/workflows/lints.yml/badge.svg)](https://github.com/aurora-is-near/aurora-relayer/actions/workflows/lints.yml)

Implements a JSON-RPC server compatible with Ethereum's
[Web3 API](https://eth.wiki/json-rpc/API) for
[Aurora Engine](https://github.com/aurora-is-near/aurora-engine)
instances deployed on the NEAR Protocol.

## Prerequisites

- [Docker] and [Docker Compose]

[Docker]: https://docs.docker.com/engine/install/
[Docker Compose]: https://docs.docker.com/compose/install/

## Usage

### Usage for Testnet

To run the relayer locally, execute:

```bash
NEAR_ENV=testnet docker-compose up
```

You can customize the configuration by copying [`config/testnet.yaml`] to
`config/local.yaml` and editing that file. (The configuration settings in
`config/local.yaml` override the defaults from `config/testnet.yaml`.)

[`config/testnet.yaml`]: https://github.com/aurora-is-near/aurora-relayer/blob/master/config/testnet.yaml

### Usage for Testnet without Docker

1. `npm i`
2. Install postgresql and create database, [example](https://github.com/aurora-is-near/aurora-relayer/blob/master/.docker/docker-entrypoint-initdb.d/init.sh) of how to create database
3. Go to indexer directory `cd util/indexer`
4. Compile `indexer` binary, `go build`
5. Return to root directory of the project
6. Run Node.js server `NEAR_ENV=testnet node lib/index.js`
7. Run indexer `sh -c util/indexer/indexer | NEAR_ENV=testnet node lib/indexer_backend.js`

### Usage for Testnet without Docker and with live changes

To see local changes without restarting the Node.js server, instead of step 6, execute:
```
NEAR_ENV=testnet npm run start
npm run build:watch
```

### Run local specs

1. Apply mocks to local database `sh test/fixtures/mocks_init.sh`
2. Run indexer `sh -c util/indexer/indexer | NEAR_ENV=testnet node lib/indexer_backend.js`
3. Run local specs `npm run test`

### Usage for LocalNet

To run the relayer locally, first start [nearcore] and then execute:

```bash
NEAR_ENV=localnet docker-compose up
```

You can customize the configuration by copying [`config/localnet.yaml`] to
`config/local.yaml` and editing that file. (The configuration settings in
`config/local.yaml` override the defaults from `config/localnet.yaml`.)

[nearcore]: https://docs.near.org/docs/community/contribute/contribute-nearcore
[`config/localnet.yaml`]: https://github.com/aurora-is-near/aurora-relayer/blob/master/config/localnet.yaml

### Endpoint URL

The relayer's HTTP endpoint is served up on the TCP port 8545 by default.

For example, you can send a Web3 JSON-RPC request to the endpoint using
[HTTPie], as follows:

```bash
http post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_blockNumber params:='[]'
```

[HTTPie]: https://httpie.io

## Configuration

To customize configuration settings, create a `config/local.yaml` file.

Configuration settings are loaded firstly from `config/default.yaml`, then from
`config/$NEAR_ENV.yaml`, and lastly from `config/local.yaml`. Settings in
files loaded later override the same settings from files loaded earlier.

### Configuring a signing key

To be able to call `eth_sendRawTransaction`, you must have a NEAR account and
signing key on the network you are relaying to, and said NEAR account must have
a sufficient Ⓝ balance to be able to send transactions.

To configure the signing account and private key, place the JSON key file
into the `config/` directory and edit `config/local.yaml` as follows:

```yaml
signer: you.testnet
signerKey: config/you.testnet.json
```

If you're using the [NEAR CLI], you will find your signing keys stored as JSON
key files under your `$HOME/.near-credentials/` directory.

[NEAR CLI]: https://docs.near.org/docs/tools/near-cli

## Status

Method | Status | Notes
------ | ------ | -----
[`web3_clientVersion`] | ✅ |
[`web3_sha3`] | ✅ |
[`net_listening`] | ✅ |
[`net_peerCount`] | ✅ |
[`net_version`] | ✅ |
[`eth_accounts`] | ✅ |
[`eth_blockNumber`] | ✅ |
[`eth_call`] | ✅ |
[`eth_chainId`] | ✅ |
[`eth_coinbase`] | ✅ |
eth_compileLLL | ❌ | Unsupported
eth_compileSerpent | ❌ | Unsupported
eth_compileSolidity | ❌ | Unsupported
[`eth_estimateGas`] | ✅ |
[`eth_gasPrice`] | ✅ |
[`eth_getBalance`] | ✅ |
[`eth_getBlockByHash`] | ✅ |
[`eth_getBlockByNumber`] | ✅ |
[`eth_getBlockTransactionCountByHash`] | ✅ |
[`eth_getBlockTransactionCountByNumber`] | ✅ |
[`eth_getCode`] | ✅ |
eth_getCompilers | ✅ |
[`eth_getFilterChanges`] | ✅ |
[`eth_getFilterLogs`] | 🚧 |
[`eth_getLogs`] | ✅ |
[`eth_getProof`] | ❌ | EIP-1186
[`eth_getStorageAt`] | ✅ |
[`eth_getTransactionByBlockHashAndIndex`] | ✅ |
[`eth_getTransactionByBlockNumberAndIndex`] | ✅ |
[`eth_getTransactionByHash`] | 🚧 |
[`eth_getTransactionCount`] | ✅ |
[`eth_getTransactionReceipt`] | ✅ |
[`eth_getUncleByBlockHashAndIndex`] | ✅ |
[`eth_getUncleByBlockNumberAndIndex`] | ✅ |
[`eth_getUncleCountByBlockHash`] | ✅ |
[`eth_getUncleCountByBlockNumber`] | ✅ |
[`eth_getWork`] | ❌ | Unsupported
[`eth_hashrate`] | ✅ |
[`eth_mining`] | ✅ |
[`eth_newBlockFilter`] | 🚧 |
[`eth_newFilter`] | 🚧 |
[`eth_newPendingTransactionFilter`] | ✅ |
[`eth_pendingTransactions`] | ✅ | [Undocumented](https://github.com/ethereum/go-ethereum/issues/1648#issuecomment-130591933)
[`eth_protocolVersion`] | ✅ |
[`eth_sendRawTransaction`] | ✅ |
[`eth_sendTransaction`] | ❌ | Unsupported
[`eth_sign`] | ❌ | Unsupported
[`eth_signTransaction`] | ❌ | Unsupported
[`eth_signTypedData`] | ❌ | Unsupported
[`eth_submitHashrate`] | ❌ | Unsupported
[`eth_submitWork`] | ❌ | Unsupported
[`eth_syncing`] | ✅ |
[`eth_uninstallFilter`] | 🚧 |
db_getHex | ❌ | Deprecated
db_getString | ❌ | Deprecated
db_putHex | ❌ | Deprecated
db_putString | ❌ | Deprecated
shh_addToGroup | ❌ | Discontinued
shh_getFilterChanges | ❌ | Discontinued
shh_getMessages | ❌ | Discontinued
shh_hasIdentity | ❌ | Discontinued
shh_newFilter | ❌ | Discontinued
shh_newGroup | ❌ | Discontinued
shh_newIdentity | ❌ | Discontinued
shh_post | ❌ | Discontinued
shh_uninstallFilter | ❌ | Discontinued
shh_version | ❌ | Discontinued
[`txpool_content`] | ✅ | Geth extension
[`txpool_inspect`] | ✅ | Geth extension
[`txpool_status`] | ✅ | Geth extension
[`parity_pendingTransactions`] | ✅ | Parity extension

**Legend**: ❌ = not supported. 🚧 = work in progress. ✅ = supported.

[`web3_clientVersion`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/web3_clientversion
[`web3_sha3`]: https://openethereum.github.io/JSONRPC-web3-module#web3_sha3
[`net_listening`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/net_listening
[`net_peerCount`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/net_peercount
[`net_version`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/net_version
[`eth_accounts`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_accounts
[`eth_blockNumber`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_blocknumber
[`eth_call`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_call
[`eth_chainId`]: https://eips.ethereum.org/EIPS/eip-695
[`eth_coinbase`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_coinbase
[`eth_estimateGas`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_estimategas
[`eth_gasPrice`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_gasprice
[`eth_getBalance`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_getbalance
[`eth_getBlockByHash`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_getblockbyhash
[`eth_getBlockByNumber`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_getblockbynumber
[`eth_getBlockTransactionCountByHash`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_getblocktransactioncountbyhash
[`eth_getBlockTransactionCountByNumber`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_getblocktransactioncountbynumber
[`eth_getCode`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_getcode
[`eth_getFilterChanges`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/filter-methods/eth_getfilterchanges
[`eth_getFilterLogs`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/filter-methods/eth_getfilterlogs
[`eth_getLogs`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_getlogs
[`eth_getProof`]: https://eips.ethereum.org/EIPS/eip-1186
[`eth_getStorageAt`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_getstorageat
[`eth_getTransactionByBlockHashAndIndex`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_gettransactionbyblockhashandindex
[`eth_getTransactionByBlockNumberAndIndex`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_gettransactionbyblocknumberandindex
[`eth_getTransactionByHash`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_gettransactionbyhash
[`eth_getTransactionCount`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_gettransactioncount
[`eth_getTransactionReceipt`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_gettransactionreceipt
[`eth_getUncleByBlockHashAndIndex`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_getunclebyblockhashandindex
[`eth_getUncleByBlockNumberAndIndex`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_getunclebyblocknumberandindex
[`eth_getUncleCountByBlockHash`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_getunclecountbyblockhash
[`eth_getUncleCountByBlockNumber`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_getunclecountbyblocknumber
[`eth_getWork`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_getwork
[`eth_hashrate`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_hashrate
[`eth_mining`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_mining
[`eth_newBlockFilter`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/filter-methods/eth_newblockfilter
[`eth_newFilter`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/filter-methods/eth_newfilter
[`eth_newPendingTransactionFilter`]: https://openethereum.github.io/JSONRPC-eth-module.html#eth_newpendingtransactionfilter
[`eth_pendingTransactions`]: https://github.com/ethereum/wiki/issues/685
[`eth_protocolVersion`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_protocolversion
[`eth_sendRawTransaction`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_sendrawtransaction
[`eth_sendTransaction`]: https://openethereum.github.io/JSONRPC-eth-module.html#eth_sendtransaction
[`eth_sign`]: https://openethereum.github.io/JSONRPC-eth-module.html#eth_sign
[`eth_signTransaction`]: https://openethereum.github.io/JSONRPC-eth-module.html#eth_signtransaction
[`eth_signTypedData`]: https://eips.ethereum.org/EIPS/eip-712
[`eth_submitHashrate`]: https://openethereum.github.io/JSONRPC-eth-module.html#eth_submithashrate
[`eth_submitWork`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_submitwork
[`eth_syncing`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_syncing
[`eth_uninstallFilter`]: https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/filter-methods/eth_uninstallfilter
[`txpool_content`]: https://geth.ethereum.org/docs/rpc/ns-txpool#txpool_content
[`txpool_inspect`]: https://geth.ethereum.org/docs/rpc/ns-txpool#txpool_inspect
[`txpool_status`]: https://geth.ethereum.org/docs/rpc/ns-txpool#txpool_status
[`parity_pendingTransactions`]: https://openethereum.github.io/JSONRPC-parity-module#parity_pendingtransactions

## Contributing

1. Clone the repo
2. Create your branch
3. Add your changes
4. Run tests (`npm run test`, the local server must be running for the tests to pass). Fix if you broke something. Add your own tests
5. Format your code (`npm run format`)
6. Run linter (`npm run lint`)
7. Build changes (`npm run build`)
8. Commit your Changes (`git commit -m 'Resolved an issue'`)
9. Push to the Branch (`git push origin new_feature`)
10. Open a Pull Request
