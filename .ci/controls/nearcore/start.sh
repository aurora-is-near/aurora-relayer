#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../common.sh


echo "Starting nearcore..."
params=()
if [[ -z $RUNNER_NAME ]]; then
    params+=(-p)
    params+=(3030:3030)
fi
docker run -d \
    --restart unless-stopped \
    -v $WORKDIR/nearData:/srv/near \
    --network $NETWORK_NAME \
    --name $NEARCORE_CONTAINER_NAME \
    "${params[@]}" \
    nearprotocol/nearcore:$NEARCORE_TAG \
    neard --home=/srv/near run
