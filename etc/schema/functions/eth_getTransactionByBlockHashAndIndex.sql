DROP FUNCTION IF EXISTS eth_getTransactionByBlockHashAndIndex(hash, int) RESTRICT;

CREATE FUNCTION eth_getTransactionByBlockHashAndIndex(_block_hash hash, transaction_index int) RETURNS transaction_result AS $$
DECLARE
  result transaction_result;
BEGIN
  SELECT
      t.block AS "blockNumber",
      t.block_hash AS "blockHash",
      t.index AS "transactionIndex",
      t.hash AS "hash",
      t.from AS "from",
      t.to AS "to",
      LEAST(t.gas_limit, 4503599627370495) AS "gas",
      t.gas_price AS "gasPrice",
      t.nonce AS "nonce",
      t.value AS "value",
      coalesce(t.input, '\x'::bytea) AS "input",
      t.v AS "v",
      t.r AS "r",
      t.s AS "s"
    FROM transaction t
    WHERE t.block_hash = _block_hash AND t.index = transaction_index
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
