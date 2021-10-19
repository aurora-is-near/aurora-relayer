DROP TABLE IF EXISTS block CASCADE;

CREATE TABLE block (
  chain             chainid NOT NULL,
  id                blockno NOT NULL PRIMARY KEY,
  hash              hash NOT NULL UNIQUE,
  near_hash         hash NULL UNIQUE,
  timestamp         instant NOT NULL,
  size              int4 NOT NULL,
  gas_limit         u256 NOT NULL,
  gas_used          u256 NOT NULL CHECK (gas_used <= gas_limit),
  parent_hash       hash NOT NULL UNIQUE,
  transactions_root hash NOT NULL,
  state_root        hash NOT NULL,
  receipts_root     hash NOT NULL
);

CREATE UNIQUE INDEX block_chain_id_idx ON block (chain, id);

CREATE INDEX block_timestamp_idx ON block USING btree (timestamp);
