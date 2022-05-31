#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../common.sh

echo "Building indexer binary..."
cd util/indexer
make
cd ../..

echo "Building database image..."
time docker build -t $DATABASE_IMAGE_NAME -f $REPO_ROOT/.docker/Dockerfile.database $REPO_ROOT/.

echo "Building endpoint image..."
time docker build -t $ENDPOINT_IMAGE_NAME -f $REPO_ROOT/.docker/Dockerfile.endpoint $REPO_ROOT/.
