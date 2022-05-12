-- +goose Up
-- +goose StatementBegin
-- ALTER TABLE block ADD COLUMN IF NOT EXISTS "logs_bloom" bytea;
ALTER TABLE block ADD COLUMN IF NOT EXISTS "logs_bloom" bytea;
ALTER TABLE block ADD COLUMN IF NOT EXISTS "miner" address;
ALTER TABLE block ADD COLUMN IF NOT EXISTS "author" varchar(255);
ALTER TABLE block ADD COLUMN IF NOT EXISTS "sequence" int8 NOT NULL;

ALTER TABLE transaction ADD COLUMN IF NOT EXISTS "access_list" json;
ALTER TABLE transaction ADD COLUMN IF NOT EXISTS "max_fee_per_gas" u256;
ALTER TABLE transaction ADD COLUMN IF NOT EXISTS "max_priority_fee_per_gas" u256;
ALTER TABLE transaction ADD COLUMN IF NOT EXISTS "type" int;
ALTER TABLE transaction ADD COLUMN IF NOT EXISTS "contract_address" address;


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
      gas_limit,                    -- gasLimit
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

CREATE FUNCTION eth_getUncleByBlockHashAndIndex(block_hash hash, uncle_index int) RETURNS block_result AS $$
BEGIN
  RETURN NULL; -- no uncle blocks
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

CREATE FUNCTION eth_getUncleByBlockNumberAndIndex(block_id blockno, uncle_index int) RETURNS block_result AS $$
BEGIN
  RETURN NULL; -- no uncle blocks
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE block DROP COLUMN "logs_bloom";
ALTER TABLE block DROP COLUMN "miner";
ALTER TABLE block DROP COLUMN "author";
ALTER TABLE block DROP COLUMN "sequence";

ALTER TABLE transaction DROP COLUMN "access_list";
ALTER TABLE transaction DROP COLUMN "max_fee_per_gas";
ALTER TABLE transaction DROP COLUMN "max_priority_fee_per_gas";
ALTER TABLE transaction DROP COLUMN "type";
ALTER TABLE transaction DROP COLUMN "contract_address";
-- +goose StatementEnd
