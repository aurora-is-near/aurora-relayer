#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../common.sh


echo "Removing endpoint, indexer and database containers..."
docker rm -f \
    $ENDPOINT_CONTAINER_NAME \
    $INDEXER_CONTAINER_NAME \
    $DATABASE_CONTAINER_NAME \
    || true
