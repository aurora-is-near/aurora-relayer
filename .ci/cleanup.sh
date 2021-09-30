#!/bin/bash -ex

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/common.sh
cd $SCRIPT_DIR/..


echo "Cleaning docker objects..."

docker stop \
    $ENDPOINT_CONTAINER_NAME \
    $INDEXER_CONTAINER_NAME \
    $DATABASE_CONTAINER_NAME \
    $NEARCORE_CONTAINER_NAME \
    || true

docker rm -f \
    $ENDPOINT_CONTAINER_NAME \
    $INDEXER_CONTAINER_NAME \
    $DATABASE_CONTAINER_NAME \
    $NEARCORE_CONTAINER_NAME \
    || true

docker rmi -f \
    $ENDPOINT_IMAGE_NAME \
    $DATABASE_IMAGE_NAME \
    || true

docker network disconnect -f $NETWORK_NAME $RUNNER_NAME || true
docker network rm $NETWORK_NAME || true


echo "Cleaning files..."
rm -rf \
    .ci/workdir \
    ~/.near-credentials \
    config/local.yaml \
    config/aurora.test.near.json


echo "Cleanup finished!"
