DROP TYPE IF EXISTS transaction_result CASCADE;

CREATE TYPE transaction_result AS (
    "blockNumber" blockno,
    "blockHash" hash,
    "transactionIndex" int2,
    "hash" hash,
    "from" address,
    "to" address,
    "gas" u256,
    "gasPrice" u256,
    "nonce" u256,
    "value" u256,
    "input" bytea,
    "v" u64,
    "r" u256,
    "s" u256
);
