#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../common.sh


export NEAR_ENV=local

NEARCORE_HOST=$NEARCORE_CONTAINER_NAME
if [[ ! -z $RUNNER_NAME ]]; then
    NEARCORE_HOST=localhost
fi

echo "Creating NEAR account..."
rm ~/.near-credentials/local/test.near.json || true
rm ~/.near-credentials/local/aurora.test.near.json || true
$WORKDIR/near-cli/bin/near create-account aurora.test.near \
    --master-account=test.near \
    --initial-balance 1000000 \
    --key-path $WORKDIR/nearData/validator_key.json \
    --node-url http://${NEARCORE_HOST}:3030

rm $WORKDIR/aurora.test.near.json || true
cp ~/.near-credentials/local/aurora.test.near.json $WORKDIR/aurora.test.near.json

echo "Downloading contract..."
rm $WORKDIR/contract.wasm || true
curl -L $CONTRACT_URL -o $WORKDIR/contract.wasm

echo "Installing contract..."
$WORKDIR/aurora-cli/lib/aurora.js install \
    --chain 1313161556 \
    --owner aurora.test.near \
    --signer aurora.test.near \
    --engine aurora.test.near \
    --endpoint http://${NEARCORE_HOST}:3030 \
    $WORKDIR/contract.wasm
