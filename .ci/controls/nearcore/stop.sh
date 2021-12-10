#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../common.sh


echo "Stopping nearcore..."
docker stop $NEARCORE_CONTAINER_NAME || true
docker rm -f $NEARCORE_CONTAINER_NAME || true
