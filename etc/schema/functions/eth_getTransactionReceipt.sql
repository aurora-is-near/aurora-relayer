DROP FUNCTION IF EXISTS eth_getTransactionReceipt(hash) RESTRICT;

CREATE FUNCTION eth_getTransactionReceipt(transaction_hash hash) RETURNS transaction_receipt AS $$
DECLARE
  result transaction_receipt;
BEGIN
  SELECT
      b.id AS "blockNumber",
      b.hash AS "blockHash",
      t.index AS "transactionIndex",
      t.hash AS "transactionHash",
      t.from AS "from",
      t.to AS "to",
      t.gas_used AS "gasUsed",
      0::u256 AS "cumulativeGasUsed", -- TODO: tally?
      CASE WHEN t.to = '\x0000000000000000000000000000000000000000' THEN t.output
           ELSE NULL
      END AS "contractAddress",
      NULL AS "logs",                 -- TODO: fetch event.id[]
      repeat('\000', 256)::bytea AS "logsBloom",
      t.status AS "status"
    FROM transaction t
      LEFT JOIN block b ON t.block = b.id
    WHERE t.hash = transaction_hash
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
