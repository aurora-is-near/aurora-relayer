DROP TYPE IF EXISTS block_result CASCADE;

CREATE TYPE block_result AS (
    "number" blockno,
    "hash" hash,
    "parentHash" hash,
    "nonce" bytea,           -- 8 bytes
    "sha3Uncles" hash,
    "logsBloom" bytea,       -- 256 bytes
    "transactionsRoot" hash,
    "stateRoot" hash,
    "receiptsRoot" hash,
    "miner" address,
    "difficulty" int2,
    "totalDifficulty" int2,
    "extraData" bytea,       -- 0 bytes
    "size" int4,
    "gasLimit" int8,
    "gasUsed" int8,
    "timestamp" int4,
    "mixHash" hash
);
