DROP TYPE IF EXISTS filter_result CASCADE;

CREATE TYPE filter_result AS (
    "blockNumber" blockno,
    "blockHash" hash,
    "transactionIndex" int,
    "transactionHash" hash,
    "logIndex" int,
    "address" address,
    "topics" hash[4],
    "data" bytea,
    "removed" boolean
);
