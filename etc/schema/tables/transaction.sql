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
