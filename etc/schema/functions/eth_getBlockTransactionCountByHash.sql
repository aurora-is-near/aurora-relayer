DROP FUNCTION IF EXISTS eth_getBlockTransactionCountByHash(hash) RESTRICT;

CREATE FUNCTION eth_getBlockTransactionCountByHash(block_hash hash) RETURNS bigint AS $$
DECLARE
  result bigint;
BEGIN
  -- FIXME: return NULL for unknown blocks
  SELECT COUNT(t.id)
    FROM transaction t
      LEFT JOIN block b ON t.block = b.id
    WHERE b.hash = block_hash
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
