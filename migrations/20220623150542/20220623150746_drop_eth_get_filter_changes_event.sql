-- +goose Up
-- +goose StatementBegin
DROP FUNCTION IF EXISTS eth_getFilterChanges_event(bytea) RESTRICT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP FUNCTION IF EXISTS eth_getFilterChanges_event(bytea) RESTRICT;
CREATE FUNCTION eth_getFilterChanges_event(filter_id bytea) RETURNS SETOF filter_result AS $$
DECLARE
  block_id blockno;
BEGIN
  SELECT coalesce(max(id), 0) FROM block INTO STRICT block_id;
  RETURN QUERY EXECUTE format(E'
    SELECT
        b.id AS "blockNumber",
        b.hash AS "blockHash",
        t.index AS "transactionIndex",
        t.hash AS "transactionHash",
        e.index AS "logIndex",
        e.from AS "address",
        e.topics AS "topics",
        coalesce(e.data, repeat(\'\\000\', 32)::bytea) AS "data",
        false AS "removed"
      FROM event e
        LEFT JOIN transaction t ON e.transaction = t.id
        LEFT JOIN block b ON t.block = b.id
      WHERE b.id >= (SELECT coalesce(f.poll_block, f.from_block, 0) FROM filter f WHERE uuid_send(f.id) = %L)
        AND b.id <= (SELECT least(f.to_block, %L) FROM filter f WHERE uuid_send(f.id) = %L)
      ORDER BY b.id ASC;
  ', filter_id, block_id, filter_id);
  UPDATE filter SET poll_block = block_id + 1 WHERE uuid_send(id) = filter_id;
  RETURN;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
-- +goose StatementEnd
