#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../common.sh


echo "Removing inner network..."
if [[ ! -z $RUNNER_NAME ]]; then
    docker network disconnect -f $NETWORK_NAME $RUNNER_NAME || true
fi
docker network rm $NETWORK_NAME || true
