DROP TABLE IF EXISTS transaction CASCADE;

CREATE TABLE transaction (
  block             blockno NOT NULL REFERENCES block ON DELETE CASCADE,
  index             int NOT NULL,
  id                bigserial NOT NULL PRIMARY KEY,
  hash              hash NOT NULL UNIQUE,
  "from"            address NOT NULL,
  "to"              address NULL,
  nonce             u256 NOT NULL,
  gas_price         u256 NOT NULL,
  gas_limit         u256 NOT NULL,
  gas_used          u256 NOT NULL CHECK (gas_used <= gas_limit),
  value             u256 NOT NULL,
  data              bytea NULL,
  v                 u64 NOT NULL,
  r                 u256 NOT NULL,
  s                 u256 NOT NULL,
  status            boolean NOT NULL
);

CREATE UNIQUE INDEX transaction_block_index_idx ON transaction (block, index);

CREATE INDEX transaction_block_idx ON transaction USING btree (block);

CREATE INDEX transaction_from_idx ON transaction USING btree ("from");

CREATE INDEX transaction_to_idx ON transaction USING btree ("to");
