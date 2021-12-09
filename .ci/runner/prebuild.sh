#!/bin/bash -e

RUNNER_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $RUNNER_DIR/../controls/common.sh


rm -rf $WORKDIR || true
$RUNNER_DIR/../setup.sh

echo "Saving workdir to cache..."
rm -rf $WORKDIR/nearData $WORKDIR/near-cli $WORKDIR/aurora-cli $WORKDIR/contract.wasm || true
cache-util msave relayer-ci-workdir-${COMMIT_HASH}:${WORKDIR} || true
rm -rf $WORKDIR || true
