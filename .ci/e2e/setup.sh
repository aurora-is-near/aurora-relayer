#!/bin/bash -e

CI_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $CI_DIR/controls/common.sh


while test $# -gt 0
do
    case "$1" in
        --start) start_relayer=true
            ;;
        --rebuild) rebuild_relayer=true
            ;;
        *) echo "bad argument $1" && exit 1
            ;;
    esac
    shift
done


if [[ ! -d $WORKDIR ]]; then
    mkdir $WORKDIR
fi

database_img=$(docker images -q ${DATABASE_IMAGE_NAME} 2> /dev/null)
endpoint_img=$(docker images -q ${ENDPOINT_IMAGE_NAME} 2> /dev/null)
if [[ ! -z $rebuild_relayer ]] || [[ -z $database_img ]] || [[ -z $endpoint_img ]]; then
    $CI_DIR/controls/relayer/build.sh
fi

if [[ ! -z $start_relayer ]]; then
    $CI_DIR/controls/network/create.sh
    echo "Sleeping for 2 seconds..." && sleep 2
    $CI_DIR/controls/relayer/configure.sh
    $CI_DIR/controls/relayer/start.sh
    echo "Sleeping for 2 seconds..." && sleep 2

    echo "Setup finished!"
    echo "Putting relayer database hostname to .ci/workdir/database.txt"
    echo "Putting relayer endpoint hostname to .ci/workdir/endpoint.txt"
    if [[ ! -z $RUNNER_NAME ]]; then
        echo $DATABASE_CONTAINER_NAME > $WORKDIR/database.txt
        echo $ENDPOINT_CONTAINER_NAME > $WORKDIR/endpoint.txt
    else
        echo localhost > $WORKDIR/database.txt
        echo localhost > $WORKDIR/endpoint.txt
    fi
fi
