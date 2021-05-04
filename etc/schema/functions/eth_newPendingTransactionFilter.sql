DROP FUNCTION IF EXISTS eth_newPendingTransactionFilter() RESTRICT;

CREATE FUNCTION eth_newPendingTransactionFilter() RETURNS bytea AS $$
BEGIN
  RETURN repeat('\000', 16)::bytea; -- the empty filter
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
