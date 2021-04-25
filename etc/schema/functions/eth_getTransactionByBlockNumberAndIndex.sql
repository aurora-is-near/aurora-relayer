DROP FUNCTION IF EXISTS eth_getTransactionByBlockNumberAndIndex(blockno, int) RESTRICT;

CREATE FUNCTION eth_getTransactionByBlockNumberAndIndex(block_id blockno, transaction_index int) RETURNS transaction_result AS $$
DECLARE
  result transaction_result;
BEGIN
  SELECT
      b.id,                         -- blockNumber
      b.hash,                       -- blockHash
      transaction_index,            -- transactionIndex
      t.hash,                       -- hash
      t.from,                       -- from
      t.to,                         -- to
      t.gas_limit,                  -- gas
      t.gas_price,                  -- gasPrice
      t.nonce,                      -- nonce
      t.value,                      -- value
      t.data,                       -- input
      t.v,                          -- v
      t.r,                          -- r
      t.s                           -- s
    FROM transaction t
      LEFT JOIN block b ON t.block = b.id
    WHERE b.id = block_id
    ORDER BY t.id ASC
    OFFSET transaction_index
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
