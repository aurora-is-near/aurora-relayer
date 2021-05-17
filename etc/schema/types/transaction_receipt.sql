DROP TYPE IF EXISTS transaction_receipt CASCADE;

CREATE TYPE transaction_receipt AS (
    "blockNumber" blockno,
    "blockHash" hash,
    "transactionIndex" int,
    "transactionHash" hash,
    "from" address,
    "to" address,
    "gasUsed" u256,
    "cumulativeGasUsed" u256,
    "contractAddress" address,
    "logs" bigint[],
    "logsBloom" bytea, -- 256 bytes
    "status" smallint,
    "nearTransactionHash" hash,
    "nearReceiptHash" hash
);
