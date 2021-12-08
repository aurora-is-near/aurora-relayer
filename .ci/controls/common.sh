#!/bin/bash -e

CONTROLS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
WORKDIR=$CONTROLS_DIR/../workdir
REPO_ROOT=$CONTROLS_DIR/../..


if [[ ! -z $RUNNER_NAME ]]; then
    # All CI-runners are docker containers, and creating new
    # Docker objects (images, containers, etc) from some runner
    # will make them appear on host-level Docker, since
    # socket-binding solution is used for Docker-in-Docker. 
    #
    # To avoid collision of such objects, $RUNNER_NAME suffix
    # is added to every object's name.

    UNIQUE_KEY=$(echo $RUNNER_NAME | tr '[:upper:]' '[:lower:]')
    COMMIT_HASH=$(git rev-parse HEAD)

    NETWORK_NAME=network-for-$UNIQUE_KEY
    DATABASE_IMAGE_NAME=relayer-database-img-$COMMIT_HASH
    ENDPOINT_IMAGE_NAME=relayer-endpoint-img-$COMMIT_HASH
    DATABASE_CONTAINER_NAME=relayer-database-$UNIQUE_KEY
    INDEXER_CONTAINER_NAME=relayer-indexer-$UNIQUE_KEY
    ENDPOINT_CONTAINER_NAME=relayer-endpoint-$UNIQUE_KEY
    NEARCORE_CONTAINER_NAME=nearcore-$UNIQUE_KEY
else
    NETWORK_NAME=relayer-testing-network
    DATABASE_IMAGE_NAME=relayer-testing-database-img
    ENDPOINT_IMAGE_NAME=relayer-testing-endpoint-img
    DATABASE_CONTAINER_NAME=relayer-testing-database
    INDEXER_CONTAINER_NAME=relayer-testing-indexer
    ENDPOINT_CONTAINER_NAME=relayer-testing-endpoint
    NEARCORE_CONTAINER_NAME=relayer-testing-nearcore
fi


# Version locks.
# Specific versions of each dependency are used
# in order to provide consistent CI.

NEAR_CLI_HEAD=69319062495bc23fceb9a2276f7e6f209fa28887
# Commit hash from: https://github.com/near/near-cli/commits/master

AURORA_CLI_HEAD=7f7c2d29c5114db2b6530a6c0fa09b2068f217df
# Commit hash from: https://github.com/aurora-is-near/aurora-cli/commits/master

NEARCORE_TAG=master-8a2be9ce7768fc4b58558ad73dacfc794b5bef4f
# Docker image tag from: https://hub.docker.com/r/nearprotocol/nearcore/tags

CONTRACT_URL=https://github.com/aurora-is-near/aurora-engine/releases/download/1.6.4/mainnet-release.wasm
# Download url from: https://github.com/aurora-is-near/aurora-engine/releases
