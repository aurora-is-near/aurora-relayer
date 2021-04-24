DROP TABLE IF EXISTS filter CASCADE;

CREATE TABLE filter (
  id                bigserial NOT NULL PRIMARY KEY,
  created_at        instant NOT NULL,
  created_by        inet NOT NULL,
  polled_at         instant NULL,
  polled_block      blockno NULL REFERENCES block ON DELETE CASCADE,
  from_block        blockno NULL REFERENCES block ON DELETE CASCADE,
  to_block          blockno NULL REFERENCES block ON DELETE CASCADE,
  addresses         address[] NULL,
  topics            hash[] NULL
);
