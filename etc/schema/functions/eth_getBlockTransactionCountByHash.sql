DROP FUNCTION IF EXISTS eth_getBlockTransactionCountByHash(hash) RESTRICT;

CREATE FUNCTION eth_getBlockTransactionCountByHash(block_hash hash) RETURNS bigint AS $$
DECLARE
  result bigint;
BEGIN
  SELECT COUNT(id) FROM transaction
    WHERE block = (SELECT id FROM block WHERE hash = block_hash)
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
