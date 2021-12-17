#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../common.sh


echo "Initializing nearcore..."
rm -rf $WORKDIR/nearData || true
mkdir $WORKDIR/nearData
docker run --rm \
    -v $WORKDIR/nearData:/srv/near \
    --name $NEARCORE_CONTAINER_NAME \
    nearprotocol/nearcore:$NEARCORE_TAG \
    neard --home=/srv/near init
