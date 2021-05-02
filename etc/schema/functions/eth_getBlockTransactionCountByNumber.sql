DROP FUNCTION IF EXISTS eth_getBlockTransactionCountByNumber(blockno) RESTRICT;

CREATE FUNCTION eth_getBlockTransactionCountByNumber(block_id blockno) RETURNS bigint AS $$
DECLARE
  result bigint;
BEGIN
  -- FIXME: return NULL for unknown blocks
  SELECT COUNT(id)
    FROM transaction
    WHERE block = block_id
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
