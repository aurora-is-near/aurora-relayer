DROP FUNCTION IF EXISTS eth_newBlockFilter(inet) RESTRICT;

CREATE FUNCTION eth_newBlockFilter(client_ip inet) RETURNS bigint AS $$
DECLARE
  block_id blockno;
  filter_id bigint;
BEGIN
  SELECT MAX(id) FROM block INTO STRICT block_id;
  INSERT INTO filter (created_at, created_by, polled_block)
    VALUES (NOW(), client_ip, block_id)
    RETURNING id INTO STRICT filter_id;
  RETURN filter_id;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
