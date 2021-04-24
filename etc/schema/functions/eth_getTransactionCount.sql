DROP FUNCTION IF EXISTS eth_getTransactionCount(address, blockno) RESTRICT;

CREATE FUNCTION eth_getTransactionCount(address address, block_id blockno) RETURNS bigint AS $$
DECLARE
  result bigint;
BEGIN -- TODO: use nonce column?
  SELECT COUNT(id) FROM transaction
    WHERE "from" = address AND block <= block_id
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
