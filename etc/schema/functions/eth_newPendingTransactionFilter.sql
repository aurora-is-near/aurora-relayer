DROP FUNCTION IF EXISTS eth_newPendingTransactionFilter() RESTRICT;

CREATE FUNCTION eth_newPendingTransactionFilter() RETURNS bigint AS $$
BEGIN
  RETURN 0; -- the empty filter
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
