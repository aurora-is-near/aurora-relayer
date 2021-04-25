DROP FUNCTION IF EXISTS eth_getUncleByBlockHashAndIndex(hash, int) RESTRICT;

CREATE FUNCTION eth_getUncleByBlockHashAndIndex(block_hash hash, uncle_index int) RETURNS block_result AS $$
BEGIN
  RETURN NULL; -- no uncle blocks
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
