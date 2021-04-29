DROP FUNCTION IF EXISTS eth_getTransactionByBlockNumberAndIndex(blockno, int) RESTRICT;

CREATE FUNCTION eth_getTransactionByBlockNumberAndIndex(block_id blockno, transaction_index int) RETURNS transaction_result AS $$
DECLARE
  result transaction_result;
BEGIN
  SELECT
      b.id AS blockNumber,
      b.hash AS blockHash,
      t.index AS transactionIndex,
      t.hash AS hash,
      t.from AS from,
      t.to AS to,
      t.gas_limit AS gas,
      t.gas_price AS gasPrice,
      t.nonce AS nonce,
      t.value AS value,
      t.data AS input,
      t.v AS v,
      t.r AS r,
      t.s AS s
    FROM transaction t
      LEFT JOIN block b ON t.block = b.id
    WHERE b.id = block_id AND t.index = transaction_index
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
