DROP FUNCTION IF EXISTS eth_getBlockByNumber(blockno) RESTRICT;

CREATE FUNCTION eth_getBlockByNumber(block_id blockno) RETURNS block_result AS $$
DECLARE
  result block_result;
BEGIN
  SELECT
      id,                           -- number
      hash,                         -- hash
      parent_hash,                  -- parentHash
      repeat('\000', 8)::bytea,     -- nonce
      '\x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',    -- sha3Uncles keccak256(rlp.encode([]))
      logs_bloom,                   -- logsBloom
      transactions_root,            -- transactionsRoot
      state_root,                   -- stateRoot
      receipts_root,                -- receiptsRoot
      repeat('\000', 20)::bytea,    -- miner
      0,                            -- difficulty
      0,                            -- totalDifficulty
      ''::bytea,                    -- extraData
      size,                         -- size
      4503599627370495,             -- gasLimit
      gas_used,                     -- gasUsed
      COALESCE(EXTRACT(EPOCH FROM timestamp), 0)::int4, -- timestamp
      repeat('\000', 32)::hash,     -- mixHash
      0                             -- baseFeePerGas
    FROM block
    WHERE id = block_id
    LIMIT 1
    INTO STRICT result;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE PARALLEL UNSAFE;
