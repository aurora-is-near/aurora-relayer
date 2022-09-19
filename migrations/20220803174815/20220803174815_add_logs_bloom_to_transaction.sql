-- +goose Up
-- +goose StatementBegin
ALTER TABLE transaction ADD COLUMN IF NOT EXISTS "logs_bloom" bytea;

ALTER TABLE event ADD COLUMN IF NOT EXISTS "block" blockno;
ALTER TABLE event ADD COLUMN IF NOT EXISTS "block_hash" hash;
ALTER TABLE event ADD COLUMN IF NOT EXISTS "transaction_index" int;
ALTER TABLE event ADD COLUMN IF NOT EXISTS "transaction_hash" hash;

CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE INDEX IF NOT EXISTS event_logs_idx on "event" USING GIN ((topics[1]), (topics[2]), (topics[3]), (topics[4]));
CREATE INDEX IF NOT EXISTS event_block_idx on "event" (block);
CREATE INDEX IF NOT EXISTS event_block_hash_idx on "event" (block_hash);
CREATE INDEX IF NOT EXISTS event_from_idx on "event" ("from");
CREATE INDEX IF NOT EXISTS event_transaction_hash_idx on "event" (transaction_hash);
CREATE INDEX IF NOT EXISTS sequence_idx ON "block" (sequence);

ALTER TABLE transaction ADD COLUMN IF NOT EXISTS "block_hash" hash;
CREATE INDEX IF NOT EXISTS transaction_block_hash_idx ON transaction USING btree (block_hash);

DROP FUNCTION IF EXISTS eth_getTransactionReceipt(hash) RESTRICT;
CREATE FUNCTION eth_getTransactionReceipt(transaction_hash hash) RETURNS transaction_receipt AS $$
DECLARE
  result transaction_receipt;
BEGIN
  SELECT
      t.block AS "blockNumber",
      t.block_hash AS "blockHash",
      t.index AS "transactionIndex",
      t.hash AS "transactionHash",
      t.from AS "from",
      t.to AS "to",
      t.gas_used AS "gasUsed",
      0::u256 AS "cumulativeGasUsed", -- TODO: tally?
      CASE WHEN (t.to IS NULL OR t.to = '\x0000000000000000000000000000000000000000') AND length(t.output) = 20 THEN t.output
           ELSE NULL
      END AS "contractAddress",
      NULL AS "logs",                 -- TODO: fetch event.id[]
      t.logs_bloom AS "logsBloom",
      CASE WHEN t.status THEN 1 ELSE 0 END AS "status",
      t.near_hash AS "nearTransactionHash",
      t.near_receipt_hash AS "nearReceiptHash"
    FROM transaction t
    WHERE t.hash = transaction_hash
    LIMIT 1
    INTO STRICT result;
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
      repeat('\000', 32)::hash      -- mixHash
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

DROP FUNCTION IF EXISTS eth_getTransactionCount(address, blockno) RESTRICT;
DROP FUNCTION IF EXISTS eth_getBlockTransactionCountByHash(hash) RESTRICT;
DROP FUNCTION IF EXISTS eth_getBlockTransactionCountByNumber(blockno) RESTRICT;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE transaction DROP COLUMN "logs_bloom";

DROP FUNCTION IF EXISTS eth_getTransactionReceipt(hash) RESTRICT;
CREATE FUNCTION eth_getTransactionReceipt(transaction_hash hash) RETURNS transaction_receipt AS $$
DECLARE
  result transaction_receipt;
BEGIN
  SELECT
      b.id AS "blockNumber",
      b.hash AS "blockHash",
      t.index AS "transactionIndex",
      t.hash AS "transactionHash",
      t.from AS "from",
      t.to AS "to",
      t.gas_used AS "gasUsed",
      0::u256 AS "cumulativeGasUsed", -- TODO: tally?
      CASE WHEN (t.to IS NULL OR t.to = '\x0000000000000000000000000000000000000000') AND length(t.output) = 20 THEN t.output
           ELSE NULL
      END AS "contractAddress",
      NULL AS "logs",                 -- TODO: fetch event.id[]
      repeat('\000', 256)::bytea AS "logsBloom",
      CASE WHEN t.status THEN 1 ELSE 0 END AS "status",
      t.near_hash AS "nearTransactionHash",
      t.near_receipt_hash AS "nearReceiptHash"
    FROM transaction t
      LEFT JOIN block b ON t.block = b.id
    WHERE t.hash = transaction_hash
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

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
      repeat('\000', 32)::hash      -- mixHash
    FROM block
    WHERE id = block_id
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

DROP FUNCTION IF EXISTS eth_getTransactionByBlockHashAndIndex(hash, int) RESTRICT;

CREATE FUNCTION eth_getTransactionByBlockHashAndIndex(block_hash hash, transaction_index int) RETURNS transaction_result AS $$
DECLARE
  result transaction_result;
BEGIN
  SELECT
      b.id AS "blockNumber",
      b.hash AS "blockHash",
      t.index AS "transactionIndex",
      t.hash AS "hash",
      t.from AS "from",
      t.to AS "to",
      t.gas_limit AS "gas",
      t.gas_price AS "gasPrice",
      t.nonce AS "nonce",
      t.value AS "value",
      coalesce(t.input, '\x'::bytea) AS "input",
      t.v AS "v",
      t.r AS "r",
      t.s AS "s"
    FROM transaction t
      LEFT JOIN block b ON t.block = b.id
    WHERE b.hash = block_hash AND t.index = transaction_index
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
      b.id AS "blockNumber",
      b.hash AS "blockHash",
      t.index AS "transactionIndex",
      t.hash AS "hash",
      t.from AS "from",
      t.to AS "to",
      t.gas_limit AS "gas",
      t.gas_price AS "gasPrice",
      t.nonce AS "nonce",
      t.value AS "value",
      coalesce(t.input, '\x'::bytea) AS "input",
      t.v AS "v",
      t.r AS "r",
      t.s AS "s"
    FROM transaction t
      LEFT JOIN block b ON t.block = b.id
    WHERE b.id = block_id AND t.index = transaction_index
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
      b.id AS "blockNumber",
      b.hash AS "blockHash",
      t.index AS "transactionIndex",
      t.hash AS "hash",
      t.from AS "from",
      t.to AS "to",
      t.gas_limit AS "gas",
      t.gas_price AS "gasPrice",
      t.nonce AS "nonce",
      t.value AS "value",
      coalesce(t.input, '\x'::bytea) AS "input",
      t.v AS "v",
      t.r AS "r",
      t.s AS "s"
    FROM transaction t
      LEFT JOIN block b ON t.block = b.id
    WHERE t.hash = transaction_hash
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

DROP FUNCTION IF EXISTS eth_getBlockTransactionCountByHash(hash) RESTRICT;
CREATE FUNCTION eth_getBlockTransactionCountByHash(block_hash hash) RETURNS bigint AS $$
DECLARE
  result bigint;
BEGIN
  -- FIXME: return NULL for unknown blocks
  SELECT COUNT(t.id)
    FROM transaction t
      LEFT JOIN block b ON t.block = b.id
    WHERE b.hash = block_hash
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

DROP FUNCTION IF EXISTS eth_getBlockTransactionCountByNumber(blockno) RESTRICT;
CREATE FUNCTION eth_getBlockTransactionCountByNumber(block_id blockno) RETURNS bigint AS $$
DECLARE
  result bigint;
BEGIN
  -- FIXME: return NULL for unknown blocks
  SELECT COUNT(id)
    FROM transaction
    WHERE block = block_id
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

DROP FUNCTION IF EXISTS eth_getTransactionCount(address, blockno) RESTRICT;
CREATE FUNCTION eth_getTransactionCount(address address, block_id blockno) RETURNS bigint AS $$
DECLARE
  result bigint;
BEGIN -- TODO: use nonce column?
  SELECT COUNT(id) FROM transaction
    WHERE "from" = address AND block <= block_id
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;


ALTER TABLE event DROP COLUMN "block";
ALTER TABLE event DROP COLUMN "block_hash";
ALTER TABLE event DROP COLUMN "transaction_index";
ALTER TABLE event DROP COLUMN "transaction_hash";

DROP INDEX IF EXISTS event_logs_idx;
DROP INDEX IF EXISTS event_block_idx;
DROP INDEX IF EXISTS event_block_hash_idx;
DROP INDEX IF EXISTS event_from_idx;
DROP INDEX IF EXISTS event_transaction_hash_idx;
DROP INDEX IF EXISTS sequence_idx;

ALTER TABLE transaction DROP COLUMN "block_hash";
DROP INDEX IF EXISTS transaction_block_hash_idx;

-- +goose StatementEnd
