DROP TYPE IF EXISTS filter_type CASCADE;

CREATE TYPE filter_type AS ENUM ('block', 'event', 'transaction');
