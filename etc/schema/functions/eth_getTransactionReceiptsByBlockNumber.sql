DROP FUNCTION IF EXISTS eth_getTransactionReceiptsByBlockNumber(blockno) RESTRICT;

CREATE FUNCTION eth_getTransactionReceiptsByBlockNumber(block_id blockno) RETURNS SETOF transaction_receipt AS $$
DECLARE
  result transaction_receipt;
BEGIN
  FOR result IN
    SELECT
        b.id AS "blockNumber",
        b.hash AS "blockHash",
        t.index AS "transactionIndex",
        t.hash AS "transactionHash",
        t.from AS "from",
        t.to AS "to",
        t.gas_used AS "gasUsed",
        0::u256 AS "cumulativeGasUsed", -- TODO: tally?
        CASE WHEN (t.to IS NULL OR t.to = '\x0000000000000000000000000000000000000000') AND length(t.output) = 20 THEN t.output
             ELSE NULL
        END AS "contractAddress",
        NULL AS "logs",                 -- TODO: fetch event.id[]
        repeat('\\000', 256)::bytea AS "logsBloom",
        CASE WHEN t.status THEN 1 ELSE 0 END AS "status"
      FROM transaction t
        LEFT JOIN block b ON t.block = b.id
      WHERE b.id = block_id
    LOOP 
	    RETURN NEXT result;
    END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
