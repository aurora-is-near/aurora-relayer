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
