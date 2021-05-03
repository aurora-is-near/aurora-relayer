DROP FUNCTION IF EXISTS eth_getFilterChanges_block(bigint) RESTRICT;
DROP FUNCTION IF EXISTS eth_getFilterChanges_event(bigint) RESTRICT;
DROP FUNCTION IF EXISTS eth_getFilterChanges_transaction(bigint) RESTRICT;

CREATE FUNCTION eth_getFilterChanges_block(filter_id bigint) RETURNS SETOF hash AS $$
DECLARE
  block_id blockno;
BEGIN
  SELECT COALESCE(MAX(id), 0) FROM block INTO STRICT block_id;
  RETURN QUERY EXECUTE format('
    SELECT b.hash FROM block b
      WHERE b.id >= (SELECT COALESCE(f.poll_block, f.from_block, 0) FROM filter f WHERE f.id = %L)
        AND b.id <= (SELECT LEAST(f.to_block, %L) FROM filter f WHERE f.id = %L)
      ORDER BY b.id ASC;
  ', filter_id, block_id, filter_id);
  UPDATE filter SET poll_block = block_id + 1 WHERE id = filter_id;
  RETURN;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

CREATE FUNCTION eth_getFilterChanges_event(filter_id bigint) RETURNS SETOF filter_result AS $$
DECLARE
  block_id blockno;
BEGIN
  SELECT COALESCE(MAX(id), 0) FROM block INTO STRICT block_id;
  RETURN QUERY EXECUTE format(E'
    SELECT
        b.id AS "blockNumber",
        b.hash AS "blockHash",
        t.index AS "transactionIndex",
        t.hash AS "transactionHash",
        e.index AS "logIndex",
        COALESCE(t.to, \'\\x0000000000000000000000000000000000000000\')::address AS "address",
        e.topics AS "topics",
        e.data AS "data",
        false AS "removed"
      FROM event e
        LEFT JOIN transaction t ON e.transaction = t.id
        LEFT JOIN block b ON t.block = b.id
      WHERE b.id >= (SELECT COALESCE(f.poll_block, f.from_block, 0) FROM filter f WHERE f.id = %L)
        AND b.id <= (SELECT LEAST(f.to_block, %L) FROM filter f WHERE f.id = %L)
      ORDER BY b.id ASC;
  ', filter_id, block_id, filter_id);
  UPDATE filter SET poll_block = block_id + 1 WHERE id = filter_id;
  RETURN;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;

CREATE FUNCTION eth_getFilterChanges_transaction(filter_id bigint) RETURNS SETOF hash AS $$
BEGIN
  RETURN; -- no pending transactions
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
