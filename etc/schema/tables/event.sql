DROP TABLE IF EXISTS event CASCADE;

CREATE TABLE event (
  id                bigserial NOT NULL PRIMARY KEY,
  transaction       bigint NOT NULL REFERENCES transaction ON DELETE CASCADE,
  topics            hash[] NULL,
  data              bytea NULL
);
