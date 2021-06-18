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
[`eth_compileLLL`] | ❌ | Unsupported
[`eth_compileSerpent`] | ❌ | Unsupported
[`eth_compileSolidity`] | ❌ | Unsupported
[`eth_estimateGas`] | ✅ |
[`eth_gasPrice`] | ✅ |
[`eth_getBalance`] | ✅ |
[`eth_getBlockByHash`] | ✅ |
[`eth_getBlockByNumber`] | ✅ |
[`eth_getBlockTransactionCountByHash`] | ✅ |
[`eth_getBlockTransactionCountByNumber`] | ✅ |
[`eth_getCode`] | ✅ |
[`eth_getCompilers`] | ✅ |
[`eth_getFilterChanges`] | 🚧 |
[`eth_getFilterLogs`] | 🚧 |
[`eth_getLogs`] | 🚧 |
[`eth_getProof`] | ❌ | EIP-1186
[`eth_getStorageAt`] | ✅ |
[`eth_getTransactionByBlockHashAndIndex`] | ✅ |
[`eth_getTransactionByBlockNumberAndIndex`] | ✅ |
[`eth_getTransactionByHash`] | 🚧 |
[`eth_getTransactionCount`] | ✅ |
[`eth_getTransactionReceipt`] | 🚧 |
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
[`db_getHex`] | ❌ | Deprecated
[`db_getString`] | ❌ | Deprecated
[`db_putHex`] | ❌ | Deprecated
[`db_putString`] | ❌ | Deprecated
[`shh_addToGroup`] | ❌ | Discontinued
[`shh_getFilterChanges`] | ❌ | Discontinued
[`shh_getMessages`] | ❌ | Discontinued
[`shh_hasIdentity`] | ❌ | Discontinued
[`shh_newFilter`] | ❌ | Discontinued
[`shh_newGroup`] | ❌ | Discontinued
[`shh_newIdentity`] | ❌ | Discontinued
[`shh_post`] | ❌ | Discontinued
[`shh_uninstallFilter`] | ❌ | Discontinued
[`shh_version`] | ❌ | Discontinued
[`txpool_content`] | ✅ | Geth extension
[`txpool_inspect`] | ✅ | Geth extension
[`txpool_status`] | ✅ | Geth extension
[`parity_pendingTransactions`] | ✅ | Parity extension

**Legend**: ❌ = not supported. 🚧 = work in progress. ✅ = supported.

[`web3_clientVersion`]: https://eth.wiki/json-rpc/API#web3_clientVersion
[`web3_sha3`]: https://eth.wiki/json-rpc/API#web3_sha3
[`net_listening`]: https://eth.wiki/json-rpc/API#net_listening
[`net_peerCount`]: https://eth.wiki/json-rpc/API#net_peerCount
[`net_version`]: https://eth.wiki/json-rpc/API#net_version
[`eth_accounts`]: https://eth.wiki/json-rpc/API#eth_accounts
[`eth_blockNumber`]: https://eth.wiki/json-rpc/API#eth_blockNumber
[`eth_call`]: https://eth.wiki/json-rpc/API#eth_call
[`eth_chainId`]: https://eips.ethereum.org/EIPS/eip-695
[`eth_coinbase`]: https://eth.wiki/json-rpc/API#eth_coinbase
[`eth_compileLLL`]: https://eth.wiki/json-rpc/API#eth_compileLLL
[`eth_compileSerpent`]: https://eth.wiki/json-rpc/API#eth_compileSerpent
[`eth_compileSolidity`]: https://eth.wiki/json-rpc/API#eth_compileSolidity
[`eth_estimateGas`]: https://eth.wiki/json-rpc/API#eth_estimateGas
[`eth_gasPrice`]: https://eth.wiki/json-rpc/API#eth_gasPrice
[`eth_getBalance`]: https://eth.wiki/json-rpc/API#eth_getBalance
[`eth_getBlockByHash`]: https://eth.wiki/json-rpc/API#eth_getBlockByHash
[`eth_getBlockByNumber`]: https://eth.wiki/json-rpc/API#eth_getBlockByNumber
[`eth_getBlockTransactionCountByHash`]: https://eth.wiki/json-rpc/API#eth_getBlockTransactionCountByHash
[`eth_getBlockTransactionCountByNumber`]: https://eth.wiki/json-rpc/API#eth_getBlockTransactionCountByNumber
[`eth_getCode`]: https://eth.wiki/json-rpc/API#eth_getCode
[`eth_getCompilers`]: https://eth.wiki/json-rpc/API#eth_getCompilers
[`eth_getFilterChanges`]: https://eth.wiki/json-rpc/API#eth_getFilterChanges
[`eth_getFilterLogs`]: https://eth.wiki/json-rpc/API#eth_getFilterLogs
[`eth_getLogs`]: https://eth.wiki/json-rpc/API#eth_getLogs
[`eth_getProof`]: https://eips.ethereum.org/EIPS/eip-1186
[`eth_getStorageAt`]: https://eth.wiki/json-rpc/API#eth_getStorageAt
[`eth_getTransactionByBlockHashAndIndex`]: https://eth.wiki/json-rpc/API#eth_getTransactionByBlockHashAndIndex
[`eth_getTransactionByBlockNumberAndIndex`]: https://eth.wiki/json-rpc/API#eth_getTransactionByBlockNumberAndIndex
[`eth_getTransactionByHash`]: https://eth.wiki/json-rpc/API#eth_getTransactionByHash
[`eth_getTransactionCount`]: https://eth.wiki/json-rpc/API#eth_getTransactionCount
[`eth_getTransactionReceipt`]: https://eth.wiki/json-rpc/API#eth_getTransactionReceipt
[`eth_getUncleByBlockHashAndIndex`]: https://eth.wiki/json-rpc/API#eth_getUncleByBlockHashAndIndex
[`eth_getUncleByBlockNumberAndIndex`]: https://eth.wiki/json-rpc/API#eth_getUncleByBlockNumberAndIndex
[`eth_getUncleCountByBlockHash`]: https://eth.wiki/json-rpc/API#eth_getUncleCountByBlockHash
[`eth_getUncleCountByBlockNumber`]: https://eth.wiki/json-rpc/API#eth_getUncleCountByBlockNumber
[`eth_getWork`]: https://eth.wiki/json-rpc/API#eth_getWork
[`eth_hashrate`]: https://eth.wiki/json-rpc/API#eth_hashrate
[`eth_mining`]: https://eth.wiki/json-rpc/API#eth_mining
[`eth_newBlockFilter`]: https://eth.wiki/json-rpc/API#eth_newBlockFilter
[`eth_newFilter`]: https://eth.wiki/json-rpc/API#eth_newFilter
[`eth_newPendingTransactionFilter`]: https://eth.wiki/json-rpc/API#eth_newPendingTransactionFilter
[`eth_pendingTransactions`]: https://github.com/ethereum/wiki/issues/685
[`eth_protocolVersion`]: https://eth.wiki/json-rpc/API#eth_protocolVersion
[`eth_sendRawTransaction`]: https://eth.wiki/json-rpc/API#eth_sendRawTransaction
[`eth_sendTransaction`]: https://eth.wiki/json-rpc/API#eth_sendTransaction
[`eth_sign`]: https://eth.wiki/json-rpc/API#eth_sign
[`eth_signTransaction`]: https://eth.wiki/json-rpc/API#eth_signTransaction
[`eth_signTypedData`]: https://eips.ethereum.org/EIPS/eip-712
[`eth_submitHashrate`]: https://eth.wiki/json-rpc/API#eth_submitHashrate
[`eth_submitWork`]: https://eth.wiki/json-rpc/API#eth_submitWork
[`eth_syncing`]: https://eth.wiki/json-rpc/API#eth_syncing
[`eth_uninstallFilter`]: https://eth.wiki/json-rpc/API#eth_uninstallFilter
[`db_getHex`]: https://eth.wiki/json-rpc/API#db_getHex
[`db_getString`]: https://eth.wiki/json-rpc/API#db_getString
[`db_putHex`]: https://eth.wiki/json-rpc/API#db_putHex
[`db_putString`]: https://eth.wiki/json-rpc/API#db_putString
[`shh_addToGroup`]: https://eth.wiki/json-rpc/API#shh_addToGroup
[`shh_getFilterChanges`]: https://eth.wiki/json-rpc/API#shh_getFilterChanges
[`shh_getMessages`]: https://eth.wiki/json-rpc/API#shh_getMessages
[`shh_hasIdentity`]: https://eth.wiki/json-rpc/API#shh_hasIdentity
[`shh_newFilter`]: https://eth.wiki/json-rpc/API#shh_newFilter
[`shh_newGroup`]: https://eth.wiki/json-rpc/API#shh_newGroup
[`shh_newIdentity`]: https://eth.wiki/json-rpc/API#shh_newIdentity
[`shh_post`]: https://eth.wiki/json-rpc/API#shh_post
[`shh_uninstallFilter`]: https://eth.wiki/json-rpc/API#shh_uninstallFilter
[`shh_version`]: https://eth.wiki/json-rpc/API#shh_version
[`txpool_content`]: https://geth.ethereum.org/docs/rpc/ns-txpool#txpool_content
[`txpool_inspect`]: https://geth.ethereum.org/docs/rpc/ns-txpool#txpool_inspect
[`txpool_status`]: https://geth.ethereum.org/docs/rpc/ns-txpool#txpool_status
[`parity_pendingTransactions`]: https://openethereum.github.io/JSONRPC-parity-module#parity_pendingtransactions
