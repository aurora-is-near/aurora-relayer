DROP FUNCTION IF EXISTS eth_getUncleByBlockNumberAndIndex(blockno, int) RESTRICT;

CREATE FUNCTION eth_getUncleByBlockNumberAndIndex(block_id blockno, uncle_index int) RETURNS block_result AS $$
BEGIN
  RETURN NULL; -- no uncle blocks
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
