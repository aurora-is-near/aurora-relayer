DROP FUNCTION IF EXISTS eth_blockNumber() RESTRICT;

CREATE FUNCTION eth_blockNumber() RETURNS blockno AS $$
DECLARE
  block_id blockno;
BEGIN
  SELECT COALESCE(MAX(id), 0) FROM block INTO STRICT block_id;
  RETURN block_id;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
