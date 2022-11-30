-- +goose Up
-- +goose StatementBegin
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
    "gasLimit" numeric,
    "gasUsed" numeric,
    "timestamp" int4,
    "mixHash" hash
);

DROP FUNCTION IF EXISTS eth_getBlockByHash(hash) RESTRICT;

CREATE FUNCTION eth_getBlockByHash(block_hash hash) RETURNS block_result AS $$
DECLARE
  result block_result;
  block_id blockno;
BEGIN
  SELECT id FROM block WHERE hash = block_hash INTO STRICT block_id;
  SELECT * FROM eth_getBlockByNumber(block_id) INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

DROP FUNCTION IF EXISTS eth_getBlockByNumber(blockno) RESTRICT;

CREATE FUNCTION eth_getBlockByNumber(block_id blockno) RETURNS block_result AS $$
DECLARE
  result block_result;
BEGIN
  SELECT
      id,                                               -- number
      hash,                                             -- hash
      parent_hash,                                      -- parentHash
      repeat('\000', 8)::bytea,                         -- nonce
      '\x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',    -- sha3Uncles keccak256(rlp.encode([]))
      logs_bloom,                                       -- logsBloom
      transactions_root,                                -- transactionsRoot
      state_root,                                       -- stateRoot
      receipts_root,                                    -- receiptsRoot
      repeat('\000', 20)::bytea,                        -- miner
      0,                                                -- difficulty
      0,                                                -- totalDifficulty
      ''::bytea,                                        -- extraData
      size,                                             -- size
      LEAST(gas_limit, 9007199254740991),           -- gasLimit
      LEAST(gas_used, 9007199254740991),            -- gasUsed
      COALESCE(EXTRACT(EPOCH FROM timestamp), 0)::int4, -- timestamp
      repeat('\000', 32)::hash,                         -- mixHash
      0
    FROM block
    WHERE id = block_id
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

DROP FUNCTION IF EXISTS eth_getTransactionByBlockHashAndIndex(hash, int) RESTRICT;

CREATE FUNCTION eth_getTransactionByBlockHashAndIndex(_block_hash hash, transaction_index int) RETURNS transaction_result AS $$
DECLARE
  result transaction_result;
BEGIN
  SELECT
      t.block AS "blockNumber",
      t.block_hash AS "blockHash",
      t.index AS "transactionIndex",
      t.hash AS "hash",
      t.from AS "from",
      t.to AS "to",
      LEAST(t.gas_limit, 9007199254740991) AS "gas",
      t.gas_price AS "gasPrice",
      t.nonce AS "nonce",
      t.value AS "value",
      coalesce(t.input, '\x'::bytea) AS "input",
      t.v AS "v",
      t.r AS "r",
      t.s AS "s"
    FROM transaction t
    WHERE t.block_hash = _block_hash AND t.index = transaction_index
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

DROP FUNCTION IF EXISTS eth_getTransactionByBlockNumberAndIndex(blockno, int) RESTRICT;

CREATE FUNCTION eth_getTransactionByBlockNumberAndIndex(block_id blockno, transaction_index int) RETURNS transaction_result AS $$
DECLARE
  result transaction_result;
BEGIN
  SELECT
      t.block AS "blockNumber",
      t.block_hash AS "blockHash",
      t.index AS "transactionIndex",
      t.hash AS "hash",
      t.from AS "from",
      t.to AS "to",
      LEAST(t.gas_limit, 9007199254740991) AS "gas",
      t.gas_price AS "gasPrice",
      t.nonce AS "nonce",
      t.value AS "value",
      coalesce(t.input, '\x'::bytea) AS "input",
      t.v AS "v",
      t.r AS "r",
      t.s AS "s"
    FROM transaction t
    WHERE t.block = block_id AND t.index = transaction_index
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

DROP FUNCTION IF EXISTS eth_getTransactionByHash(hash) RESTRICT;

CREATE FUNCTION eth_getTransactionByHash(transaction_hash hash) RETURNS transaction_result AS $$
DECLARE
  result transaction_result;
BEGIN
  SELECT
      t.block AS "blockNumber",
      t.block_hash AS "blockHash",
      t.index AS "transactionIndex",
      t.hash AS "hash",
      t.from AS "from",
      t.to AS "to",
      LEAST(t.gas_limit, 9007199254740991) AS "gas",
      t.gas_price AS "gasPrice",
      t.nonce AS "nonce",
      t.value AS "value",
      coalesce(t.input, '\x'::bytea) AS "input",
      t.v AS "v",
      t.r AS "r",
      t.s AS "s"
    FROM transaction t
    WHERE t.hash = transaction_hash
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
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
    "gasLimit" numeric,
    "gasUsed" int8,
    "timestamp" int4,
    "mixHash" hash
);

DROP FUNCTION IF EXISTS eth_getBlockByHash(hash) RESTRICT;

CREATE FUNCTION eth_getBlockByHash(block_hash hash) RETURNS block_result AS $$
DECLARE
  result block_result;
  block_id blockno;
BEGIN
  SELECT id FROM block WHERE hash = block_hash INTO STRICT block_id;
  SELECT * FROM eth_getBlockByNumber(block_id) INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

DROP FUNCTION IF EXISTS eth_getBlockByNumber(blockno) RESTRICT;

CREATE FUNCTION eth_getBlockByNumber(block_id blockno) RETURNS block_result AS $$
DECLARE
  result block_result;
BEGIN
  SELECT
      id,                           -- number
      hash,                         -- hash
      parent_hash,                  -- parentHash
      repeat('\000', 8)::bytea,     -- nonce
      '\x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',    -- sha3Uncles keccak256(rlp.encode([]))
      logs_bloom,                   -- logsBloom
      transactions_root,            -- transactionsRoot
      state_root,                   -- stateRoot
      receipts_root,                -- receiptsRoot
      repeat('\000', 20)::bytea,    -- miner
      0,                            -- difficulty
      0,                            -- totalDifficulty
      ''::bytea,                    -- extraData
      size,                         -- size
      4503599627370495,             -- gasLimit
      gas_used,                     -- gasUsed
      COALESCE(EXTRACT(EPOCH FROM timestamp), 0)::int4, -- timestamp
      repeat('\000', 32)::hash,     -- mixHash
      0
    FROM block
    WHERE id = block_id
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

DROP FUNCTION IF EXISTS eth_getTransactionByBlockHashAndIndex(hash, int) RESTRICT;

CREATE FUNCTION eth_getTransactionByBlockHashAndIndex(_block_hash hash, transaction_index int) RETURNS transaction_result AS $$
DECLARE
  result transaction_result;
BEGIN
  SELECT
      t.block AS "blockNumber",
      t.block_hash AS "blockHash",
      t.index AS "transactionIndex",
      t.hash AS "hash",
      t.from AS "from",
      t.to AS "to",
      LEAST(t.gas_limit, 4503599627370495) AS "gas",
      t.gas_price AS "gasPrice",
      t.nonce AS "nonce",
      t.value AS "value",
      coalesce(t.input, '\x'::bytea) AS "input",
      t.v AS "v",
      t.r AS "r",
      t.s AS "s"
    FROM transaction t
    WHERE t.block_hash = _block_hash AND t.index = transaction_index
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

CREATE FUNCTION eth_getTransactionByBlockNumberAndIndex(block_id blockno, transaction_index int) RETURNS transaction_result AS $$
DECLARE
  result transaction_result;
BEGIN
  SELECT
      t.block AS "blockNumber",
      t.block_hash AS "blockHash",
      t.index AS "transactionIndex",
      t.hash AS "hash",
      t.from AS "from",
      t.to AS "to",
      LEAST(t.gas_limit, 4503599627370495) AS "gas",
      t.gas_price AS "gasPrice",
      t.nonce AS "nonce",
      t.value AS "value",
      coalesce(t.input, '\x'::bytea) AS "input",
      t.v AS "v",
      t.r AS "r",
      t.s AS "s"
    FROM transaction t
    WHERE t.block = block_id AND t.index = transaction_index
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

DROP FUNCTION IF EXISTS eth_getTransactionByHash(hash) RESTRICT;

CREATE FUNCTION eth_getTransactionByHash(transaction_hash hash) RETURNS transaction_result AS $$
DECLARE
  result transaction_result;
BEGIN
  SELECT
      t.block AS "blockNumber",
      t.block_hash AS "blockHash",
      t.index AS "transactionIndex",
      t.hash AS "hash",
      t.from AS "from",
      t.to AS "to",
      LEAST(t.gas_limit, 4503599627370495) AS "gas",
      t.gas_price AS "gasPrice",
      t.nonce AS "nonce",
      t.value AS "value",
      coalesce(t.input, '\x'::bytea) AS "input",
      t.v AS "v",
      t.r AS "r",
      t.s AS "s"
    FROM transaction t
    WHERE t.hash = transaction_hash
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
-- +goose StatementEnd
