#!/bin/bash -e

RUNNER_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $RUNNER_DIR/../controls/common.sh


rm -rf $WORKDIR || true

echo "Restoring workdir from cache..."
cache-util restore relayer-ci-workdir-${COMMIT_HASH}:${WORKDIR} || true

$RUNNER_DIR/../setup.sh --start
