DROP FUNCTION IF EXISTS eth_getFilterLogs_block(bigint) RESTRICT;
DROP FUNCTION IF EXISTS eth_getFilterLogs_event(bigint) RESTRICT;
DROP FUNCTION IF EXISTS eth_getFilterLogs_transaction(bigint) RESTRICT;

CREATE FUNCTION eth_getFilterLogs_block(filter_id bigint) RETURNS SETOF hash AS $$
DECLARE
  block_id blockno;
BEGIN
  SELECT COALESCE(MAX(id), 0) FROM block INTO STRICT block_id;
  RETURN QUERY EXECUTE format('
    SELECT b.hash FROM block b
      WHERE b.id >= (SELECT COALESCE(f.from_block, 0) FROM filter f WHERE f.id = %L)
        AND b.id <= (SELECT LEAST(f.to_block, %L) FROM filter f WHERE f.id = %L)
      ORDER BY b.id ASC;
  ', filter_id, block_id, filter_id);
  RETURN;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

CREATE FUNCTION eth_getFilterLogs_event(filter_id bigint) RETURNS SETOF filter_result AS $$
DECLARE
  block_id blockno;
BEGIN
  SELECT COALESCE(MAX(id), 0) FROM block INTO STRICT block_id;
  RETURN QUERY EXECUTE format('
    SELECT
        b.id,     -- blockNumber
        b.hash,   -- blockHash
        0,        -- transactionIndex TODO
        t.hash,   -- transactionHash
        0,        -- logIndex TODO
        t.from,   -- address FIXME
        e.topics, -- topics
        e.data,   -- data
        false     -- removed
      FROM event e
        LEFT JOIN transaction t ON e.transaction = t.id
        LEFT JOIN block b ON t.block = b.id
      WHERE b.id >= (SELECT COALESCE(f.from_block, 0) FROM filter f WHERE f.id = %L)
        AND b.id <= (SELECT LEAST(f.to_block, %L) FROM filter f WHERE f.id = %L)
      ORDER BY b.id ASC;
  ', filter_id, block_id, filter_id);
  RETURN;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

CREATE FUNCTION eth_getFilterLogs_transaction(filter_id bigint) RETURNS SETOF hash AS $$
BEGIN
  RETURN; -- no pending transactions
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
