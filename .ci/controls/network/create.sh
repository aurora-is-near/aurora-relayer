#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../common.sh


echo "Establishing inner network..."
docker network create -d bridge $NETWORK_NAME
if [[ ! -z $RUNNER_NAME ]]; then
    docker network connect $NETWORK_NAME $RUNNER_NAME
fi
