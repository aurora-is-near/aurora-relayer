DROP FUNCTION IF EXISTS eth_getFilterLogs_block(bytea) RESTRICT;
DROP FUNCTION IF EXISTS eth_getFilterLogs_event(bytea) RESTRICT;
DROP FUNCTION IF EXISTS eth_getFilterLogs_transaction(bytea) RESTRICT;

CREATE FUNCTION eth_getFilterLogs_block(filter_id bytea) RETURNS SETOF hash AS $$
DECLARE
  block_id blockno;
BEGIN
  SELECT coalesce(max(id), 0) FROM block INTO STRICT block_id;
  RETURN QUERY EXECUTE format('
    SELECT b.hash FROM block b
      WHERE b.id >= (SELECT coalesce(f.from_block, 0) FROM filter f WHERE uuid_send(f.id) = %L)
        AND b.id <= (SELECT least(f.to_block, %L) FROM filter f WHERE uuid_send(f.id) = %L)
      ORDER BY b.id ASC;
  ', filter_id, block_id, filter_id);
  RETURN;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

CREATE FUNCTION eth_getFilterLogs_transaction(filter_id bytea) RETURNS SETOF hash AS $$
BEGIN
  RETURN; -- no pending transactions
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
