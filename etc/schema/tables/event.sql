DROP TABLE IF EXISTS event CASCADE;

CREATE TABLE event (
  transaction       bigint NOT NULL REFERENCES transaction ON DELETE CASCADE,
  index             int NOT NULL,
  id                bigserial NOT NULL PRIMARY KEY,
  data              bytea NULL,
  topics            hash[] NULL
);

CREATE UNIQUE INDEX event_transaction_index_idx ON event (transaction, index);
