DROP FUNCTION IF EXISTS eth_getTransactionByHash(hash) RESTRICT;

CREATE FUNCTION eth_getTransactionByHash(transaction_hash hash) RETURNS transaction_result AS $$
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
    WHERE t.hash = transaction_hash
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
