DROP TABLE IF EXISTS event CASCADE;

CREATE TABLE event (
  transaction       bigint NOT NULL REFERENCES transaction ON DELETE CASCADE,
  block             blockno NOT NULL,
  block_hash        hash NOT NULL,
  transaction_index int NOT NULL CHECK (index >= 0),
  transaction_hash  hash NOT NULL,
  index             int NOT NULL CHECK (index >= 0),
  id                bigserial NOT NULL PRIMARY KEY,
  data              bytea NULL CHECK (length(data) > 0),
  "from"            address NULL,
  topics            hash[] NULL CHECK (array_length(topics, 1) > 0 AND array_length(topics, 1) <= 4)
);

CREATE UNIQUE INDEX event_transaction_index_idx ON event (transaction, index);
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE INDEX IF NOT EXISTS event_logs_idx on "event" USING GIN ((topics[1]), (topics[2]), (topics[3]), (topics[4]));
CREATE INDEX IF NOT EXISTS event_block_idx on "event" (block);
CREATE INDEX IF NOT EXISTS event_block_hash_idx on "event" (block_hash);
CREATE INDEX IF NOT EXISTS event_from_idx on "event" ("from");
CREATE INDEX IF NOT EXISTS event_transaction_hash_idx on "event" (transaction_hash);
