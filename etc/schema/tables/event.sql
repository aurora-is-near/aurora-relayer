DROP TABLE IF EXISTS event CASCADE;

CREATE TABLE event (
  transaction       bigint NOT NULL REFERENCES transaction ON DELETE CASCADE,
  index             int NOT NULL CHECK (index >= 0),
  id                bigserial NOT NULL PRIMARY KEY,
  data              bytea NULL CHECK (length(data) > 0),
  topics            hash[] NULL CHECK (array_length(topics, 1) > 0 AND array_length(topics, 1) <= 4)
);

CREATE UNIQUE INDEX event_transaction_index_idx ON event (transaction, index);
