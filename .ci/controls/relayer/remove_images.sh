#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../common.sh


echo "Removing database and endpoint images..."
docker rmi -f $DATABASE_IMAGE_NAME $ENDPOINT_IMAGE_NAME || true
