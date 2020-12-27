Run the tests in this file using Cram <https://bitheap.org/cram/>.

net_version:

  $ http --ignore-stdin post http://localhost:3030 jsonrpc=2.0 id=1 method=net_version params:='[]'
  {"jsonrpc":"2.0","id":"1","result":"1313161554"} (no-eol)

net_listening:

  $ http --ignore-stdin post http://localhost:3030 jsonrpc=2.0 id=1 method=net_listening params:='[]'
  {"jsonrpc":"2.0","id":"1","result":true} (no-eol)
