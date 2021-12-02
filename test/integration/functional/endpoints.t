Run the tests in this file using Cram <https://bitheap.org/cram/>.

web3_clientVersion:

  $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=web3_clientVersion
  {"jsonrpc":"2.0","id":"1","result":"Aurora-Relayer/0.0.0"} (no-eol)

web3_sha3:

  $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=web3_sha3 params:='["0x68656c6c6f20776f726c64"]'
  {"jsonrpc":"2.0","id":"1","result":"0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad"} (no-eol)

net_listening:

  $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=net_listening
  {"jsonrpc":"2.0","id":"1","result":true} (no-eol)

net_peerCount:

  $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=net_peerCount
  {"jsonrpc":"2.0","id":"1","result":"0x0"} (no-eol)

net_version:

  $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=net_version
  {"jsonrpc":"2.0","id":"1","result":"1313161555"} (no-eol)

eth_accounts:

  $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_accounts
  {"jsonrpc":"2.0","id":"1","result":[]} (no-eol)

# eth_blockNumber: // convered in rpcs

# eth_call:

# eth_chainId:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_chainId
#   {"jsonrpc":"2.0","id":"1","result":"0x4e454154"} (no-eol)

# eth_coinbase:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_coinbase
#   {"jsonrpc":"2.0","id":"1","result":"0x0000000000000000000000000000000000000000"} (no-eol)

# eth_compileLLL:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_compileLLL params:='[""]'
#   {"jsonrpc":"2.0","id":"1","error":{"code":-32601,"message":"Unsupported method: eth_compileLLL"}} (no-eol)

# eth_compileSerpent:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_compileSerpent params:='[""]'
#   {"jsonrpc":"2.0","id":"1","error":{"code":-32601,"message":"Unsupported method: eth_compileSerpent"}} (no-eol)

# eth_compileSolidity:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_compileSolidity params:='[""]'
#   {"jsonrpc":"2.0","id":"1","error":{"code":-32601,"message":"Unsupported method: eth_compileSolidity"}} (no-eol)

# eth_estimateGas:

# eth_gasPrice:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_gasPrice
#   {"jsonrpc":"2.0","id":"1","result":"0x0"} (no-eol)

# eth_getBalance:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getBalance params:='["0x0000000000000000000000000000000000000000","latest"]'
#   {"jsonrpc":"2.0","id":"1","result":"0x0"} (no-eol)

# eth_getBlockByHash:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getBlockByHash params:='["0x0000000000000000000000000000000000000000000000000000000000000000",false]'
#   {"jsonrpc":"2.0","id":"1","result":null} (no-eol)

# eth_getBlockByNumber:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getBlockByNumber params:='["0xffffffff",false]'
#   {"jsonrpc":"2.0","id":"1","result":null} (no-eol)

# eth_getBlockTransactionCountByHash:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getBlockTransactionCountByHash params:='["0x0000000000000000000000000000000000000000000000000000000000000000"]'
#   {"jsonrpc":"2.0","id":"1","result":null} (no-eol)

# eth_getBlockTransactionCountByNumber:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getBlockTransactionCountByNumber params:='["0x0"]'
#   {"jsonrpc":"2.0","id":"1","result":"0x0"} (no-eol)

# eth_getCode:

# eth_getCompilers:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getCompilers
#   {"jsonrpc":"2.0","id":"1","result":[]} (no-eol)

# eth_getFilterChanges:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getFilterChanges params:='["0x0"]'
#   {"jsonrpc":"2.0","id":"1","result":[]} (no-eol)

# eth_getFilterLogs:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getFilterLogs params:='["0x0"]'
#   {"jsonrpc":"2.0","id":"1","result":[]} (no-eol)

# eth_getLogs:

# eth_getProof:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getProof params:='["",[],""]'
#   {"jsonrpc":"2.0","id":"1","error":{"code":-32601,"message":"Unsupported method: eth_getProof"}} (no-eol)

# eth_getStorageAt:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getStorageAt params:='["0x0000000000000000000000000000000000000000","0x0","latest"]'
#   {"jsonrpc":"2.0","id":"1","result":"0x0000000000000000000000000000000000000000000000000000000000000000"} (no-eol)

# eth_getTransactionByBlockHashAndIndex:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getTransactionByBlockHashAndIndex params:='["0x0000000000000000000000000000000000000000000000000000000000000000","0x0"]'
#   {"jsonrpc":"2.0","id":"1","result":null} (no-eol)

# eth_getTransactionByBlockNumberAndIndex:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getTransactionByBlockNumberAndIndex params:='["0x0","0x0"]'
#   {"jsonrpc":"2.0","id":"1","result":null} (no-eol)

# eth_getTransactionByHash:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getTransactionByHash params:='["0x0000000000000000000000000000000000000000000000000000000000000000"]'
#   {"jsonrpc":"2.0","id":"1","result":null} (no-eol)

# eth_getTransactionCount:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getTransactionCount params:='["0x0000000000000000000000000000000000000000","latest"]'
#   {"jsonrpc":"2.0","id":"1","result":"0x0"} (no-eol)

# eth_getTransactionReceipt:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getTransactionReceipt params:='["0x0000000000000000000000000000000000000000000000000000000000000000"]'
#   {"jsonrpc":"2.0","id":"1","result":null} (no-eol)

# eth_getUncleByBlockHashAndIndex:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getUncleByBlockHashAndIndex params:='["0x0000000000000000000000000000000000000000000000000000000000000000","0x0"]'
#   {"jsonrpc":"2.0","id":"1","result":null} (no-eol)

# eth_getUncleByBlockNumberAndIndex:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getUncleByBlockNumberAndIndex params:='["0x0","0x0"]'
#   {"jsonrpc":"2.0","id":"1","result":null} (no-eol)

# eth_getUncleCountByBlockHash:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getUncleCountByBlockHash params:='["0x0000000000000000000000000000000000000000000000000000000000000000"]'
#   {"jsonrpc":"2.0","id":"1","result":null} (no-eol)

# eth_getUncleCountByBlockNumber:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getUncleCountByBlockNumber params:='["0x0"]'
#   {"jsonrpc":"2.0","id":"1","result":null} (no-eol)

# eth_getWork:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_getWork
#   {"jsonrpc":"2.0","id":"1","error":{"code":-32601,"message":"Unsupported method: eth_getWork"}} (no-eol)

# eth_hashrate:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_hashrate
#   {"jsonrpc":"2.0","id":"1","result":"0x0"} (no-eol)

# eth_mining:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_mining
#   {"jsonrpc":"2.0","id":"1","result":false} (no-eol)

# eth_newBlockFilter:

# eth_newFilter:

# eth_newPendingTransactionFilter:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_newPendingTransactionFilter
#   {"jsonrpc":"2.0","id":"1","result":"0x00000000000000000000000000000000"} (no-eol)

# eth_pendingTransactions:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_pendingTransactions
#   {"jsonrpc":"2.0","id":"1","result":[]} (no-eol)

# eth_protocolVersion:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_protocolVersion
#   {"jsonrpc":"2.0","id":"1","result":"0x41"} (no-eol)

# eth_sendRawTransaction:

# eth_sendTransaction:

# eth_sign:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_sign params:='["",""]'
#   {"jsonrpc":"2.0","id":"1","error":{"code":-32601,"message":"Unsupported method: eth_sign"}} (no-eol)

# eth_signTransaction:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_signTransaction params:='[{}]'
#   {"jsonrpc":"2.0","id":"1","error":{"code":-32601,"message":"Unsupported method: eth_signTransaction"}} (no-eol)

# eth_signTypedData:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_signTypedData params:='["",{}]'
#   {"jsonrpc":"2.0","id":"1","error":{"code":-32601,"message":"Unsupported method: eth_signTypedData"}} (no-eol)

# eth_submitHashrate:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_submitHashrate params:='["",""]'
#   {"jsonrpc":"2.0","id":"1","error":{"code":-32601,"message":"Unsupported method: eth_submitHashrate"}} (no-eol)

# eth_submitWork:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_submitWork params:='["","",""]'
#   {"jsonrpc":"2.0","id":"1","error":{"code":-32601,"message":"Unsupported method: eth_submitWork"}} (no-eol)

# eth_syncing:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_syncing
#   {"jsonrpc":"2.0","id":"1","result":false} (no-eol)

# eth_uninstallFilter:

#   $ http -Ib post http://localhost:8545 jsonrpc=2.0 id=1 method=eth_uninstallFilter params:='["0x0"]'
#   {"jsonrpc":"2.0","id":"1","result":true} (no-eol)
