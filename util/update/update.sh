#!/bin/sh
basedir="/srv/aurora/relayer"


if [ -f "${basedir}/config/testnet.yaml" ]; then
	DBURL=$(grep "^database:" < "${basedir}/config/testnet.yaml" 2> /dev/null | awk '{print $NF}')
fi

if [ -f "${basedir}/config/mainnet.yaml" ]; then
	DBURL=$(grep "^database:" < "${basedir}/config/mainnet.yaml" 2> /dev/null | awk '{print $NF}')
fi

if [ -z "${DBURL}" ]; then
	echo "NO DBURL"
	exit 1
fi	

echo "CREATE TABLE IF NOT EXISTS \"db_upgrades\" (Version varchar(255) NOT NULL UNIQUE, Success boolean NOT NULL );" | psql "${DBURL}" -tAq 2> /dev/null

cat "${basedir}/.docker/.manifest" | while read entry command; do
	res=$(echo "SELECT CASE WHEN EXISTS (SELECT version FROM db_upgrades WHERE version='${entry}' ) THEN 1 ELSE 0 END;" | psql "${DBURL}" -tA)
	if [ "${res}" -eq 0 ]; then
		cmdType=$(echo "${command}" | awk '{ print $1 }')
		cmdParameter=$(echo "${command}" | awk '{ $1=""; print $NF }')
		success=0
		case "${cmdType}" in
			"sql")
				psql "${DBURL}" -tA < "${basedir}/${cmdParameter}" && success=1
				;;
			"goose")
				export GOOSE_DBSTRING="${DBURL}?sslmode=disable" 
				GOOSE_DRIVER=postgres "${basedir}/util/goose/goose" -dir "${basedir}/migrations/${cmdParameter}" up && success=1
				;;
			*)
				eval "${cmdType} ${basedir}/${cmdParameter}" && success=1
				;;
		esac
		if [ ${success} -eq 1 ]; then
			echo "SUCCESS: ${entry} ${command}"
			echo "INSERT INTO db_upgrades (Version, Success) VALUES('${entry}',true);" | psql "${DBURL}" -tA
		else
			echo "FAILED: ${entry} ${command}"		
			echo "INSERT INTO db_upgrades (Version, Success) VALUES('${entry}',false);" | psql "${DBURL}" -tA
			echo "===== FAILED ====="
			exit 1
		fi
	else		
		echo "SKIPPED: ${entry} ${command}"		
	fi
done
echo "===== SUCCESS ====="
exit 0
