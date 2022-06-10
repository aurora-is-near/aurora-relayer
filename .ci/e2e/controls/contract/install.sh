#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../common.sh


export NEAR_ENV=local


echo "Creating NEAR account..."
rm ~/.near-credentials/local/test.near.json || true
rm ~/.near-credentials/local/aurora.test.near.json || true
$WORKDIR/near-cli/bin/near create-account aurora.test.near \
    --master-account=test.near \
    --initial-balance 1000000 \
    --key-path $WORKDIR/nearData/validator_key.json \
    --node-url http://${NEARCORE_HOST}:3030

rm $WORKDIR/aurora.test.near.json || true
chmod 777 ~/.near-credentials/local/aurora.test.near.json
cp ~/.near-credentials/local/aurora.test.near.json $WORKDIR/aurora.test.near.json
