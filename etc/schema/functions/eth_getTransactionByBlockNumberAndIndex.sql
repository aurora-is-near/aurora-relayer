DROP FUNCTION IF EXISTS eth_getTransactionByBlockNumberAndIndex(blockno, int) RESTRICT;

CREATE FUNCTION eth_getTransactionByBlockNumberAndIndex(block_id blockno, transaction_index int) RETURNS transaction_result AS $$
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
      LEAST(t.gas_limit, 9007199254740991) AS "gas",
      t.gas_price AS "gasPrice",
      t.nonce AS "nonce",
      t.value AS "value",
      coalesce(t.input, '\x'::bytea) AS "input",
      t.v AS "v",
      t.r AS "r",
      t.s AS "s"
    FROM transaction t
    WHERE t.block = block_id AND t.index = transaction_index
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
