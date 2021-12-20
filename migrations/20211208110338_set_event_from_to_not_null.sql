-- +goose Up
ALTER TABLE event ALTER COLUMN "from" SET NOT NULL;
-- +goose StatementBegin
SELECT 'up SQL query';
-- +goose StatementEnd

-- +goose Down
ALTER TABLE event ALTER COLUMN "from" DROP NOT NULL;
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
