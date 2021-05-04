DROP FUNCTION IF EXISTS eth_newFilter(inet, blockno, blockno, address[], jsonb) RESTRICT;

CREATE FUNCTION eth_newFilter(client_ip inet, from_block blockno, to_block blockno, addresses address[], topics jsonb) RETURNS bytea AS $$
DECLARE
  block_id blockno;
  filter_uuid uuid;
BEGIN
  SELECT max(id) FROM block INTO STRICT block_id;
  INSERT INTO filter
      (id, type, created_at, created_by, poll_block, from_block, to_block, addresses, topics)
    VALUES
      (gen_random_uuid(), 'event', now(), client_ip, block_id + 1, from_block, to_block, addresses, topics)
    RETURNING id INTO STRICT filter_uuid;
  RETURN uuid_send(filter_uuid);
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
