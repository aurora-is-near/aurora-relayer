DROP FUNCTION IF EXISTS eth_getUncleCountByBlockNumber(blockno) RESTRICT;

CREATE FUNCTION eth_getUncleCountByBlockNumber(block_id blockno) RETURNS bigint AS $$
BEGIN
  PERFORM id FROM block WHERE id = block_id;
  IF FOUND THEN RETURN 0; ELSE RETURN NULL; END IF;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
