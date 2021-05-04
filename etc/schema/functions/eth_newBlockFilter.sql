DROP FUNCTION IF EXISTS eth_newBlockFilter(inet) RESTRICT;

CREATE FUNCTION eth_newBlockFilter(client_ip inet) RETURNS bytea AS $$
DECLARE
  block_id blockno;
  filter_uuid uuid;
BEGIN
  SELECT max(id) FROM block INTO STRICT block_id;
  INSERT INTO filter
      (id, type, created_at, created_by, poll_block)
    VALUES
      (gen_random_uuid(), 'block', now(), client_ip, block_id + 1)
    RETURNING id INTO STRICT filter_uuid;
  RETURN uuid_send(filter_uuid);
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
