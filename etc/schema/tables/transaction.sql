DROP TABLE IF EXISTS transaction CASCADE;

CREATE TABLE transaction (
  block                     blockno NOT NULL REFERENCES block ON DELETE CASCADE,
  index                     int NOT NULL CHECK (index >= 0),
  id                        bigserial NOT NULL PRIMARY KEY,
  hash                      hash NOT NULL UNIQUE,
  near_hash                 hash NOT NULL,
  near_receipt_hash         hash NULL,
  "from"                    address NOT NULL,
  "to"                      address NULL,
  nonce                     u256 NOT NULL,
  gas_price                 u256 NOT NULL,
  gas_limit                 u256 NOT NULL,
  gas_used                  u256 NOT NULL, -- FIXME: CHECK (gas_used <= gas_limit),
  value                     u256 NOT NULL,
  input                     bytea NULL CHECK (length(input) > 0),
  v                         u64 NULL,
  r                         u256 NULL,
  s                         u256 NULL,
  status                    boolean NOT NULL,
  output                    bytea NULL CHECK (length(output) > 0),
  access_list               json NULL,
  max_fee_per_gas           u256 NULL,
  max_priority_fee_per_gas  u256 NULL,
  type                      int NOT NULL,
  contract_address          address NULL
);

CREATE UNIQUE INDEX transaction_block_index_idx ON transaction (block, index);

CREATE INDEX transaction_block_idx ON transaction USING btree (block);

CREATE INDEX transaction_from_idx ON transaction USING btree ("from");

CREATE INDEX transaction_to_idx ON transaction USING btree ("to");
