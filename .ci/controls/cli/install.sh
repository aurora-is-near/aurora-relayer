#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../common.sh


echo "Installing near-cli..."
cd $WORKDIR
rm -rf near-cli || true
git clone https://github.com/near/near-cli.git
cd near-cli
git checkout -q $NEAR_CLI_HEAD
time npm install

echo "Installing aurora-cli..."
cd $WORKDIR
rm -rf aurora-cli || true
git clone https://github.com/aurora-is-near/aurora-cli.git
cd aurora-cli
git checkout -q $AURORA_CLI_HEAD
time npm install
