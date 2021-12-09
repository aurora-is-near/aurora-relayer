#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../common.sh


echo "Creating relayer configuration..."
rm $REPO_ROOT/config/aurora.test.near.json || true
cp $WORKDIR/aurora.test.near.json $REPO_ROOT/config/aurora.test.near.json
rm $REPO_ROOT/config/local.yaml || true
cat >$REPO_ROOT/config/local.yaml <<EOF
---
port: 8545
database: postgres://aurora:aurora@${DATABASE_CONTAINER_NAME}/aurora
broker:
network: local
endpoint: http://${NEARCORE_CONTAINER_NAME}:3030
engine: aurora.test.near
signer: aurora.test.near
signerKey: config/aurora.test.near.json
writable: true
debug: false
verbose: false
force: false
EOF
