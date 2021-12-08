#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../common.sh


echo "Starting database..."
params=()
if [[ -z $RUNNER_NAME ]]; then
    params+=(-p)
    params+=(5432:5432)
fi
docker run -d \
    --restart unless-stopped \
    --network $NETWORK_NAME \
    --name $DATABASE_CONTAINER_NAME \
    "${params[@]}" \
    $DATABASE_IMAGE_NAME

echo "Starting indexer..."
docker run -d --init \
    --restart unless-stopped \
    --network $NETWORK_NAME \
    -e WAIT_HOSTS=${DATABASE_CONTAINER_NAME}:5432 \
    -e WAIT_BEFORE=1 \
    -e NEAR_ENV=localnet \
    -e NODE_ENV=localnet \
    -v $REPO_ROOT/config:/srv/aurora/relayer/config \
    --name $INDEXER_CONTAINER_NAME \
    $ENDPOINT_IMAGE_NAME \
    sh -c "util/indexer/indexer | node lib/indexer_backend.js"

echo "Starting endpoint..."
params=()
if [[ -z $RUNNER_NAME ]]; then
    params+=(-p)
    params+=(8545:8545)
fi
docker run -d --init \
    --restart unless-stopped \
    --network $NETWORK_NAME \
    -e WAIT_HOSTS=${DATABASE_CONTAINER_NAME}:5432 \
    -e WAIT_BEFORE=1 \
    -e NEAR_ENV=localnet \
    -e NODE_ENV=localnet \
    -v $REPO_ROOT/config:/srv/aurora/relayer/config \
    --name $ENDPOINT_CONTAINER_NAME \
    "${params[@]}" \
    $ENDPOINT_IMAGE_NAME \
    node lib/index.js
