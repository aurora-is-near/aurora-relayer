#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../common.sh

echo "Creating relayer configuration..."
mkdir -p ~/.near-credentials/testnet
echo $TEST_NET_KEY > ~/.near-credentials/testnet/aurora-relayer-ci.testnet.json
cp ~/.near-credentials/testnet/aurora-relayer-ci.testnet.json $REPO_ROOT/config/aurora-relayer-ci.testnet.json

rm $REPO_ROOT/config/local.yaml || true
cat >$REPO_ROOT/config/local.yaml <<EOF
---
port: 8545
database: postgres://aurora:aurora@${DATABASE_CONTAINER_NAME}/aurora_test
broker:
network: testnet
endpoint: https://archival-rpc.testnet.near.org
engine: aurora
signer: aurora-relayer-ci.testnet
signerKey: config/aurora-relayer-ci.testnet.json
writable: true
debug: false
verbose: false
force: false
EOF
