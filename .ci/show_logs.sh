#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/common.sh


if [[ $1 == "nearcore" ]]; then
    docker logs $NEARCORE_CONTAINER_NAME
elif [[ $1 == "database" ]]; then
    docker logs $DATABASE_CONTAINER_NAME
elif [[ $1 == "indexer" ]]; then
    docker logs $INDEXER_CONTAINER_NAME
elif [[ $1 == "endpoint" ]]; then
    docker logs $ENDPOINT_CONTAINER_NAME
else
    echo "Unknown argument: $1"
fi
