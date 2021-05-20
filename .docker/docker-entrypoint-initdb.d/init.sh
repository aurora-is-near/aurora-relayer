#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOF
  CREATE USER aurora PASSWORD 'aurora';
  CREATE DATABASE aurora;
  GRANT ALL PRIVILEGES ON DATABASE aurora TO aurora;
EOF
psql -v ON_ERROR_STOP=1 --username aurora --dbname aurora < /docker-entrypoint-initdb.d/init.txt
