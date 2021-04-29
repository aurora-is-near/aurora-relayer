DROP FUNCTION IF EXISTS eth_newFilter(inet, blockno, blockno, address[], jsonb) RESTRICT;

CREATE FUNCTION eth_newFilter(client_ip inet, from_block blockno, to_block blockno, addresses address[], topics jsonb) RETURNS bigint AS $$
DECLARE
  block_id blockno;
  filter_id bigint;
BEGIN
  SELECT MAX(id) FROM block INTO STRICT block_id;
  INSERT INTO filter
      (type, created_at, created_by, poll_block, from_block, to_block, addresses, topics)
    VALUES
      ('event', NOW(), client_ip, block_id + 1, from_block, to_block, addresses, topics)
    RETURNING id INTO STRICT filter_id;
  RETURN filter_id;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
