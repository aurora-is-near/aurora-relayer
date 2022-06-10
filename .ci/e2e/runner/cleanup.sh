#!/bin/bash -e

RUNNER_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $RUNNER_DIR/../controls/common.sh


$RUNNER_DIR/../stop.sh --clean
