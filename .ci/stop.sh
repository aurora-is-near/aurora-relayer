#!/bin/bash -e

CI_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $CI_DIR/controls/common.sh


while test $# -gt 0
do
    case "$1" in
        --clean) remove_images=true
            ;;
        *) echo "bad argument $1" && exit 1
            ;;
    esac
    shift
done


$CI_DIR/controls/relayer/stop.sh
$CI_DIR/controls/relayer/remove.sh
$CI_DIR/controls/nearcore/stop.sh
$CI_DIR/controls/network/remove.sh
if [[ ! -z $remove_images ]]; then
    $CI_DIR/controls/relayer/remove_images.sh
fi
