DROP TABLE IF EXISTS event CASCADE;

CREATE TABLE event (
  id                bigserial NOT NULL PRIMARY KEY,
  transaction       bigint NOT NULL REFERENCES transaction ON DELETE CASCADE,
  index             int NOT NULL,
  topics            hash[] NULL,
  data              bytea NULL
);
