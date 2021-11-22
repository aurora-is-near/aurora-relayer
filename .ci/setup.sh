#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/common.sh


echo "Environment will be cleaned to avoid dirty start"
./.ci/cleanup.sh
cd $SCRIPT_DIR/..


echo "Establishing inner network..."
docker network create -d bridge $NETWORK_NAME
docker network connect $NETWORK_NAME $RUNNER_NAME


echo "Building database image..."
time docker build -t $DATABASE_IMAGE_NAME -f .docker/Dockerfile.database .


echo "Building endpoint image..."
time docker build -t $ENDPOINT_IMAGE_NAME -f .docker/Dockerfile.endpoint .


mkdir .ci/workdir
cd .ci/workdir

echo "Installing near-cli..."
git clone https://github.com/near/near-cli.git
cd near-cli
git checkout -q $NEAR_CLI_HEAD
time npm install
cd ..

echo "Installing aurora-cli..."
git clone https://github.com/aurora-is-near/aurora-cli.git
cd aurora-cli
git checkout -q $AURORA_CLI_HEAD
time npm install
cd ..

mkdir nearData
cd ../..


echo "Starting nearcore..."
docker run --rm \
    -v $(pwd)/.ci/workdir/nearData:/srv/near \
    --name $NEARCORE_CONTAINER_NAME \
    nearprotocol/nearcore:$NEARCORE_TAG \
    neard --home=/srv/near init
docker run -d \
    --restart unless-stopped \
    -v $(pwd)/.ci/workdir/nearData:/srv/near \
    --network $NETWORK_NAME \
    --name $NEARCORE_CONTAINER_NAME \
    nearprotocol/nearcore:$NEARCORE_TAG \
    neard --home=/srv/near run

echo "Sleeping for 5 seconds..."
sleep 5


export NEAR_ENV=local

echo "Creating NEAR account..."
.ci/workdir/near-cli/bin/near create-account aurora.test.near \
    --master-account=test.near \
    --initial-balance 1000000 \
    --key-path .ci/workdir/nearData/validator_key.json \
    --node-url http://${NEARCORE_CONTAINER_NAME}:3030

echo "Downloading contract..."
curl -L $CONTRACT_URL -o .ci/workdir/contract.wasm

echo "Installing contract..."
.ci/workdir/aurora-cli/lib/aurora.js install \
    --chain 1313161556 \
    --owner aurora.test.near \
    --signer aurora.test.near \
    --engine aurora.test.near \
    --endpoint http://${NEARCORE_CONTAINER_NAME}:3030 \
    .ci/workdir/contract.wasm

echo "Sleeping for 5 seconds..."
sleep 5


echo "Creating relayer configuration..."
cp ~/.near-credentials/local/aurora.test.near.json config/aurora.test.near.json
cat >config/local.yaml <<EOF
---
port: 8545
database: postgres://aurora:aurora@${DATABASE_CONTAINER_NAME}/aurora
broker:
network: local
endpoint: http://${NEARCORE_CONTAINER_NAME}:3030
engine: aurora.test.near
signer: aurora.test.near
signerKey: config/aurora.test.near.json
EOF

echo "Starting database..."
docker run -d \
    --restart unless-stopped \
    --network $NETWORK_NAME \
    --name $DATABASE_CONTAINER_NAME \
    $DATABASE_IMAGE_NAME

echo "Starting indexer..."
docker run -d --init \
    --restart unless-stopped \
    --network $NETWORK_NAME \
    -e NEAR_ENV=localnet \
    -e NODE_ENV=localnet \
    -v $(pwd)/config:/srv/aurora/relayer/config \
    --name $INDEXER_CONTAINER_NAME \
    $ENDPOINT_IMAGE_NAME \
    node lib/indexer_backend.js

echo "Starting endpoint..."
docker run -d --init \
    --restart unless-stopped \
    --network $NETWORK_NAME \
    -e NEAR_ENV=localnet \
    -e NODE_ENV=localnet \
    -v $(pwd)/config:/srv/aurora/relayer/config \
    --name $ENDPOINT_CONTAINER_NAME \
    $ENDPOINT_IMAGE_NAME \
    node lib/index.js

echo "Sleeping for 5 seconds..."
sleep 5

echo "Setup finished! Putting relayer endpoint hostname to .ci/workdir/endpoint.txt"
echo $ENDPOINT_CONTAINER_NAME > .ci/workdir/endpoint.txt
