DROP FUNCTION IF EXISTS eth_getTransactionByBlockHashAndIndex(hash, int) RESTRICT;

CREATE FUNCTION eth_getTransactionByBlockHashAndIndex(block_hash hash, transaction_index int) RETURNS transaction_result AS $$
DECLARE
  result transaction_result;
BEGIN
  SELECT
      b.id AS "blockNumber",
      b.hash AS "blockHash",
      t.index AS "transactionIndex",
      t.hash AS "hash",
      t.from AS "from",
      t.to AS "to",
      t.gas_limit AS "gas",
      t.gas_price AS "gasPrice",
      t.nonce AS "nonce",
      t.value AS "value",
      coalesce(t.input, '\x'::bytea) AS "input",
      t.v AS "v",
      t.r AS "r",
      t.s AS "s"
    FROM transaction t
      LEFT JOIN block b ON t.block = b.id
    WHERE b.hash = block_hash AND t.index = transaction_index
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
