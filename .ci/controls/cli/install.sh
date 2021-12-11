#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../common.sh


echo "Installing near-cli..."
cd $WORKDIR
rm -rf near-cli || true
if [[ ! -z $RUNNER_NAME ]]; then
    cache-util restore near-cli-${NEAR_CLI_HEAD}:${WORKDIR}/near-cli || true
fi
if [[ ! -d near-cli ]]; then
    git clone https://github.com/near/near-cli.git
    cd near-cli
    git checkout -q $NEAR_CLI_HEAD
    time npm install
    if [[ ! -z $RUNNER_NAME ]]; then
        cache-util save near-cli-${NEAR_CLI_HEAD}:${WORKDIR}/near-cli || true
    fi
fi

echo "Installing aurora-cli..."
cd $WORKDIR
rm -rf aurora-cli || true
if [[ ! -z $RUNNER_NAME ]]; then
    cache-util restore near-cli-${AURORA_CLI_HEAD}:${WORKDIR}/aurora-cli || true
fi
if [[ ! -d aurora-cli ]]; then
    git clone https://github.com/aurora-is-near/aurora-cli.git
    cd aurora-cli
    git checkout -q $AURORA_CLI_HEAD
    time npm install
    if [[ ! -z $RUNNER_NAME ]]; then
        cache-util save near-cli-${AURORA_CLI_HEAD}:${WORKDIR}/aurora-cli || true
    fi
fi
