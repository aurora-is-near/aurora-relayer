#!/bin/bash -e


# All CI-runners are docker containers, and creating new
# Docker objects (images, containers, etc) from some runner
# will make them appear on host-level Docker, since
# socket-binding solution is used for Docker-in-Docker. 
#
# To avoid collision of such objects, $RUNNER_NAME suffix
# is added to every object's name.

UNIQUE_KEY=$(echo $RUNNER_NAME | tr '[:upper:]' '[:lower:]')

NETWORK_NAME=network-for-$UNIQUE_KEY
DATABASE_IMAGE_NAME=relayer-database-img-$UNIQUE_KEY
ENDPOINT_IMAGE_NAME=relayer-endpoint-img-$UNIQUE_KEY
DATABASE_CONTAINER_NAME=relayer-database-$UNIQUE_KEY
INDEXER_CONTAINER_NAME=relayer-indexer-$UNIQUE_KEY
ENDPOINT_CONTAINER_NAME=relayer-endpoint-$UNIQUE_KEY
NEARCORE_CONTAINER_NAME=nearcore-$UNIQUE_KEY


# Version locks.
# Specific versions of each dependency are used
# in order to provide consistent CI.

NEAR_CLI_HEAD=e7a2c8fcd428b6ae006dcf5340b1469d9ec815b0
# Commit hash from: https://github.com/near/near-cli/commits/master

AURORA_CLI_HEAD=7f7c2d29c5114db2b6530a6c0fa09b2068f217df
# Commit hash from: https://github.com/aurora-is-near/aurora-cli/commits/master

NEARCORE_TAG=master-8a2be9ce7768fc4b58558ad73dacfc794b5bef4f
# Docker image tag from: https://hub.docker.com/r/nearprotocol/nearcore/tags

CONTRACT_URL=https://github.com/aurora-is-near/aurora-engine/releases/download/1.6.4/mainnet-release.wasm
# Download url from: https://github.com/aurora-is-near/aurora-engine/releases
