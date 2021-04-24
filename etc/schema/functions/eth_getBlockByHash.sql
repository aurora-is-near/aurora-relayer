DROP FUNCTION IF EXISTS eth_getBlockByHash(hash) RESTRICT;

CREATE FUNCTION eth_getBlockByHash(block_hash hash) RETURNS block_result AS $$
DECLARE
  result block_result;
  block_id blockno;
BEGIN
  SELECT id FROM block WHERE hash = block_hash INTO STRICT block_id;
  SELECT * FROM eth_getBlockByNumber(block_id) INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
