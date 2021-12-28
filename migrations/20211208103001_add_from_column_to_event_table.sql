-- +goose Up
ALTER TABLE event ADD COLUMN IF NOT EXISTS "from" address;
-- +goose StatementBegin
SELECT 'up SQL query';
-- +goose StatementEnd

-- +goose Down
ALTER TABLE event DROP COLUMN "from";
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
