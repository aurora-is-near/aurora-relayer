# Proxy server for Ethereum JSON RPC to NEAR EVM

Provides a JSON RPC interface compatible with [Ethereum's API](https://eth.wiki/json-rpc/API) to NEAR's EVM environment.

## Usage

To install and start the local server, run:
```
npm install
npm run dev
```

In your wallet, truffle, etc - change node url to the url of this server.

For example:
```
http post http://localhost:3000 jsonrpc=2.0 method=eth_blockNumber params:='[]' id=123
```

## Status

Method | Status | Notes
------ | ------ | -----
[`web3_clientVersion`] | |
[`web3_sha3`] | |
[`net_version`] | |
[`net_peerCount`] | |
[`net_listening`] | |
[`eth_protocolVersion`] | |
[`eth_syncing`] | |
[`eth_coinbase`] | |
[`eth_mining`] | |
[`eth_hashrate`] | |
[`eth_gasPrice`] | |
[`eth_accounts`] | |
[`eth_blockNumber`] | ✅ |
[`eth_getBalance`] | |
[`eth_getStorageAt`] | |
[`eth_getTransactionCount`] | |
[`eth_getBlockTransactionCountByHash`] | |
[`eth_getBlockTransactionCountByNumber`] | |
[`eth_getUncleCountByBlockHash`] | |
[`eth_getUncleCountByBlockNumber`] | |
[`eth_getCode`] | |
[`eth_sign`] | |
[`eth_signTransaction`] | |
[`eth_sendTransaction`] | |
[`eth_sendRawTransaction`] | |
[`eth_call`] | |
[`eth_estimateGas`] | |
[`eth_getBlockByHash`] | |
[`eth_getBlockByNumber`] | |
[`eth_getTransactionByHash`] | |
[`eth_getTransactionByBlockHashAndIndex`] | |
[`eth_getTransactionByBlockNumberAndIndex`] | |
[`eth_getTransactionReceipt`] | |
[`eth_getUncleByBlockHashAndIndex`] | |
[`eth_getUncleByBlockNumberAndIndex`] | |
[`eth_getCompilers`] | |
[`eth_compileLLL`] | |
[`eth_compileSolidity`] | |
[`eth_compileSerpent`] | |
[`eth_newFilter`] | |
[`eth_newBlockFilter`] | |
[`eth_newPendingTransactionFilter`] | |
[`eth_uninstallFilter`] | |
[`eth_getFilterChanges`] | |
[`eth_getFilterLogs`] | |
[`eth_getLogs`] | |
[`eth_getWork`] | |
[`eth_submitWork`] | |
[`eth_submitHashrate`] | |
[`db_putString`] | |
[`db_getString`] | |
[`db_putHex`] | |
[`db_getHex`] | |
[`shh_post`] | |
[`shh_version`] | |
[`shh_newIdentity`] | |
[`shh_hasIdentity`] | |
[`shh_newGroup`] | |
[`shh_addToGroup`] | |
[`shh_newFilter`] | |
[`shh_uninstallFilter`] | |
[`shh_getFilterChanges`] | |
[`shh_getMessages`] | |

**Legend**: ❌ = not supported. 🚧 = work in progress. ✅ = supported.

[`web3_clientVersion`]: https://eth.wiki/json-rpc/API#web3_clientVersion
[`web3_sha3`]: https://eth.wiki/json-rpc/API#web3_sha3
[`net_version`]: https://eth.wiki/json-rpc/API#net_version
[`net_peerCount`]: https://eth.wiki/json-rpc/API#net_peerCount
[`net_listening`]: https://eth.wiki/json-rpc/API#net_listening
[`eth_protocolVersion`]: https://eth.wiki/json-rpc/API#eth_protocolVersion
[`eth_syncing`]: https://eth.wiki/json-rpc/API#eth_syncing
[`eth_coinbase`]: https://eth.wiki/json-rpc/API#eth_coinbase
[`eth_mining`]: https://eth.wiki/json-rpc/API#eth_mining
[`eth_hashrate`]: https://eth.wiki/json-rpc/API#eth_hashrate
[`eth_gasPrice`]: https://eth.wiki/json-rpc/API#eth_gasPrice
[`eth_accounts`]: https://eth.wiki/json-rpc/API#eth_accounts
[`eth_blockNumber`]: https://eth.wiki/json-rpc/API#eth_blockNumber
[`eth_getBalance`]: https://eth.wiki/json-rpc/API#eth_getBalance
[`eth_getStorageAt`]: https://eth.wiki/json-rpc/API#eth_getStorageAt
[`eth_getTransactionCount`]: https://eth.wiki/json-rpc/API#eth_getTransactionCount
[`eth_getBlockTransactionCountByHash`]: https://eth.wiki/json-rpc/API#eth_getBlockTransactionCountByHash
[`eth_getBlockTransactionCountByNumber`]: https://eth.wiki/json-rpc/API#eth_getBlockTransactionCountByNumber
[`eth_getUncleCountByBlockHash`]: https://eth.wiki/json-rpc/API#eth_getUncleCountByBlockHash
[`eth_getUncleCountByBlockNumber`]: https://eth.wiki/json-rpc/API#eth_getUncleCountByBlockNumber
[`eth_getCode`]: https://eth.wiki/json-rpc/API#eth_getCode
[`eth_sign`]: https://eth.wiki/json-rpc/API#eth_sign
[`eth_signTransaction`]: https://eth.wiki/json-rpc/API#eth_signTransaction
[`eth_sendTransaction`]: https://eth.wiki/json-rpc/API#eth_sendTransaction
[`eth_sendRawTransaction`]: https://eth.wiki/json-rpc/API#eth_sendRawTransaction
[`eth_call`]: https://eth.wiki/json-rpc/API#eth_call
[`eth_estimateGas`]: https://eth.wiki/json-rpc/API#eth_estimateGas
[`eth_getBlockByHash`]: https://eth.wiki/json-rpc/API#eth_getBlockByHash
[`eth_getBlockByNumber`]: https://eth.wiki/json-rpc/API#eth_getBlockByNumber
[`eth_getTransactionByHash`]: https://eth.wiki/json-rpc/API#eth_getTransactionByHash
[`eth_getTransactionByBlockHashAndIndex`]: https://eth.wiki/json-rpc/API#eth_getTransactionByBlockHashAndIndex
[`eth_getTransactionByBlockNumberAndIndex`]: https://eth.wiki/json-rpc/API#eth_getTransactionByBlockNumberAndIndex
[`eth_getTransactionReceipt`]: https://eth.wiki/json-rpc/API#eth_getTransactionReceipt
[`eth_getUncleByBlockHashAndIndex`]: https://eth.wiki/json-rpc/API#eth_getUncleByBlockHashAndIndex
[`eth_getUncleByBlockNumberAndIndex`]: https://eth.wiki/json-rpc/API#eth_getUncleByBlockNumberAndIndex
[`eth_getCompilers`]: https://eth.wiki/json-rpc/API#eth_getCompilers
[`eth_compileLLL`]: https://eth.wiki/json-rpc/API#eth_compileLLL
[`eth_compileSolidity`]: https://eth.wiki/json-rpc/API#eth_compileSolidity
[`eth_compileSerpent`]: https://eth.wiki/json-rpc/API#eth_compileSerpent
[`eth_newFilter`]: https://eth.wiki/json-rpc/API#eth_newFilter
[`eth_newBlockFilter`]: https://eth.wiki/json-rpc/API#eth_newBlockFilter
[`eth_newPendingTransactionFilter`]: https://eth.wiki/json-rpc/API#eth_newPendingTransactionFilter
[`eth_uninstallFilter`]: https://eth.wiki/json-rpc/API#eth_uninstallFilter
[`eth_getFilterChanges`]: https://eth.wiki/json-rpc/API#eth_getFilterChanges
[`eth_getFilterLogs`]: https://eth.wiki/json-rpc/API#eth_getFilterLogs
[`eth_getLogs`]: https://eth.wiki/json-rpc/API#eth_getLogs
[`eth_getWork`]: https://eth.wiki/json-rpc/API#eth_getWork
[`eth_submitWork`]: https://eth.wiki/json-rpc/API#eth_submitWork
[`eth_submitHashrate`]: https://eth.wiki/json-rpc/API#eth_submitHashrate
[`db_putString`]: https://eth.wiki/json-rpc/API#db_putString
[`db_getString`]: https://eth.wiki/json-rpc/API#db_getString
[`db_putHex`]: https://eth.wiki/json-rpc/API#db_putHex
[`db_getHex`]: https://eth.wiki/json-rpc/API#db_getHex
[`shh_post`]: https://eth.wiki/json-rpc/API#shh_post
[`shh_version`]: https://eth.wiki/json-rpc/API#shh_version
[`shh_newIdentity`]: https://eth.wiki/json-rpc/API#shh_newIdentity
[`shh_hasIdentity`]: https://eth.wiki/json-rpc/API#shh_hasIdentity
[`shh_newGroup`]: https://eth.wiki/json-rpc/API#shh_newGroup
[`shh_addToGroup`]: https://eth.wiki/json-rpc/API#shh_addToGroup
[`shh_newFilter`]: https://eth.wiki/json-rpc/API#shh_newFilter
[`shh_uninstallFilter`]: https://eth.wiki/json-rpc/API#shh_uninstallFilter
[`shh_getFilterChanges`]: https://eth.wiki/json-rpc/API#shh_getFilterChanges
[`shh_getMessages`]: https://eth.wiki/json-rpc/API#shh_getMessages
