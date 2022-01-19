UPDATE event SET "from" = repeat('\000', 20)::bytea WHERE transaction = 51 AND "from" IS NULL;
