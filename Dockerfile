FROM postgres:13.3
ENV POSTGRES_PASSWORD postgres
COPY .docker/docker-entrypoint-initdb.d/init.* /docker-entrypoint-initdb.d/
