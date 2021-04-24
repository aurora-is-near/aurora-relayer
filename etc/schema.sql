DROP DOMAIN IF EXISTS address CASCADE;
CREATE DOMAIN address AS bytea
  CHECK (length(value) = 20);

DROP DOMAIN IF EXISTS blockno CASCADE;
CREATE DOMAIN blockno AS int8
  CHECK (value >= 0);

DROP DOMAIN IF EXISTS chainid CASCADE;
CREATE DOMAIN chainid AS int4
  CHECK (value >= 1);

DROP DOMAIN IF EXISTS hash CASCADE;
CREATE DOMAIN hash AS bytea
  CHECK (length(value) = 32);

DROP DOMAIN IF EXISTS instant CASCADE;
CREATE DOMAIN instant AS timestamptz
  CHECK (value > timestamptz '2015-07-30T00:00:00Z');

DROP DOMAIN IF EXISTS u64 CASCADE;
CREATE DOMAIN u64 AS numeric(20, 0)
  CHECK (value >= 0 AND value <= 18446744073709551615);

DROP DOMAIN IF EXISTS u256 CASCADE;
CREATE DOMAIN u256 AS numeric(78, 0)
  CHECK (value >= 0 AND value <= 115792089237316195423570985008687907853269984665640564039457584007913129639935);

DROP TABLE IF EXISTS block CASCADE;
CREATE TABLE block (
  id                blockno NOT NULL PRIMARY KEY,
  hash              hash NOT NULL UNIQUE,
  chain             chainid NOT NULL,
  timestamp         instant NOT NULL,
  size              int4 NOT NULL,
  gas_limit         int8 NOT NULL,
  gas_used          int8 NOT NULL CHECK (gas_used <= gas_limit),
  nonce             bytea NOT NULL CHECK (length(nonce) = 8),
  parent_hash       hash NOT NULL UNIQUE,
  transactions_root hash NOT NULL,
  state_root        hash NOT NULL,
  receipts_root     hash NOT NULL
);

DROP TABLE IF EXISTS transaction CASCADE;
CREATE TABLE transaction (
  id                bigserial NOT NULL PRIMARY KEY,
  hash              hash NOT NULL UNIQUE,
  block             blockno NOT NULL REFERENCES block ON DELETE CASCADE,
  "from"            address NOT NULL,
  "to"              address NULL,
  nonce             u256 NOT NULL,
  gas_price         u256 NOT NULL,
  gas_limit         u256 NOT NULL,
  value             u256 NOT NULL,
  data              bytea NULL,
  v                 u64 NOT NULL,
  r                 u256 NOT NULL,
  s                 u256 NOT NULL
);

DROP TABLE IF EXISTS filter CASCADE;
CREATE TABLE filter (
  id                bigserial NOT NULL PRIMARY KEY,
  created_at        instant NOT NULL,
  created_by        inet NOT NULL,
  polled_at         instant NULL,
  polled_block      blockno NULL REFERENCES block ON DELETE CASCADE,
  from_block        blockno NULL REFERENCES block ON DELETE CASCADE,
  to_block          blockno NULL REFERENCES block ON DELETE CASCADE,
  addresses         address[] NULL,
  topics            hash[] NULL
);
