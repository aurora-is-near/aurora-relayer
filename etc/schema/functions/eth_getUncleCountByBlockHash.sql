DROP FUNCTION IF EXISTS eth_getUncleCountByBlockHash(hash) RESTRICT;

CREATE FUNCTION eth_getUncleCountByBlockHash(block_hash hash) RETURNS bigint AS $$
BEGIN
  PERFORM id FROM block WHERE hash = block_hash;
  IF FOUND THEN RETURN 0; ELSE RETURN NULL; END IF;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
