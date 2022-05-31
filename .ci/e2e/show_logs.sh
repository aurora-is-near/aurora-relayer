#!/bin/bash -e

CI_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $CI_DIR/controls/common.sh

if [[ $1 == "database" ]]; then
    docker logs $DATABASE_CONTAINER_NAME
elif [[ $1 == "indexer" ]]; then
    docker logs $INDEXER_CONTAINER_NAME
elif [[ $1 == "endpoint" ]]; then
    docker logs $ENDPOINT_CONTAINER_NAME
else
    echo "Unknown argument: $1"
fi
