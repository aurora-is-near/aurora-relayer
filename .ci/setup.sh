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
        --reset) reset_near=true
            ;;
        --reinit) reinit_near=true
            ;;
        --reinstall-cli) reinstall_cli=true
            ;;
        *) echo "bad argument $1"
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

if [[ ! -z $reinit_near ]] || [[ ! -d $WORKDIR/nearDataBackup ]]; then

    if [[ ! -z $reinstall_cli ]] || [[ ! -d $WORKDIR/near-cli ]] || [[ ! -d $WORKDIR/aurora-cli ]]; then
        $CI_DIR/controls/cli/install.sh    
    fi

    rm -rf $WORKDIR/nearData $WORKDIR/nearDataBackup || true
    $CI_DIR/controls/network/create.sh
    $CI_DIR/controls/nearcore/init.sh
    $CI_DIR/controls/nearcore/start.sh
    echo "Sleeping for 5 seconds..." && sleep 5
    $CI_DIR/controls/contract/install.sh
    echo "Sleeping for 5 seconds..." && sleep 5
    $CI_DIR/controls/nearcore/stop.sh
    $CI_DIR/controls/network/remove.sh
    mv $WORKDIR/nearData $WORKDIR/nearDataBackup
fi

if [[ ! -z $reset_near ]] || [[ ! -d $WORKDIR/nearData ]]; then
    rm -rf $WORKDIR/nearData || true
    cp -r $WORKDIR/nearDataBackup $WORKDIR/nearData
fi

if [[ ! -z $start_relayer ]]; then
    $CI_DIR/controls/network/create.sh
    $CI_DIR/controls/nearcore/start.sh
    echo "Sleeping for 5 seconds..." && sleep 5
    $CI_DIR/controls/relayer/configure.sh
    $CI_DIR/controls/relayer/start.sh
    echo "Sleeping for 5 seconds..." && sleep 5

    echo "Setup finished!"
    echo "Putting nearcore hostname to .ci/workdir/nearcore.txt"
    echo "Putting relayer database hostname to .ci/workdir/database.txt"
    echo "Putting relayer endpoint hostname to .ci/workdir/endpoint.txt"
    if [[ -z $RUNNER_NAME ]]; then
        echo $NEARCORE_CONTAINER_NAME > $WORKDIR/nearcore.txt
        echo $DATABASE_CONTAINER_NAME > $WORKDIR/database.txt
        echo $ENDPOINT_CONTAINER_NAME > $WORKDIR/endpoint.txt
    else
        echo localhost > $WORKDIR/nearcore.txt
        echo localhost > $WORKDIR/database.txt
        echo localhost > $WORKDIR/endpoint.txt
    fi
fi
