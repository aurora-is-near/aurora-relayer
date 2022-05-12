package main

import (
	"encoding/hex"
	"fmt"
	"math/big"
	"reflect"
	"strings"
	"time"

	"github.com/btcsuite/btcutil/base58"
)

type Uint256 string
type H256 string
type Address string

func (val Uint256) toSqlValue() string {
	bigInt, ok := new(big.Int).SetString(string(val), 0)
	if ok {
		return bigInt.Text(10)
	} else {
		return "0"
	}
}

type insertData map[string]interface{}
type insertArgs []interface{}

type Block struct {
	ChainId          uint64        `cbor:"chain_id"`
	Hash             H256          `cbor:"hash"`        //H256
	ParentHash       H256          `cbor:"parent_hash"` //H256
	Height           uint64        `cbor:"height"`
	Miner            Address       `cbor:"miner"` //Address
	Timestamp        int64         `cbor:"timestamp"`
	GasLimit         Uint256       `cbor:"gas_limit"`         //U256
	GasUsed          Uint256       `cbor:"gas_used"`          //U256
	LogsBloom        string        `cbor:"logs_bloom"`        //U256
	TransactionsRoot H256          `cbor:"transactions_root"` //H256
	ReceiptsRoot     H256          `cbor:"receipts_root"`     //H256
	Transactions     []Transaction `cbor:"transactions"`      //Vec<AuroraTransaction>,
	NearBlock        any           `cbor:"near_metadata"`     // pub near_metadata: NearBlock,
	StateRoot        string        `cbor:"state_root"`
	Size             Uint256       `cbor:"size"`
	Sequence         uint64
}

func (block Block) sqlInsertArgs() insertArgs {
	var existingBlock ExistingBlock
	switch reflect.TypeOf(block.NearBlock).String() {
	case "map[interface {}]interface {}":
		parsedExistingBlock := block.NearBlock.(map[interface{}]interface{})["ExistingBlock"].(map[interface{}]interface{})
		existingBlock = ExistingBlock{
			NearHash:       parsedExistingBlock["near_hash"].(string),
			NearParentHash: parsedExistingBlock["near_parent_hash"].(string),
			Author:         parsedExistingBlock["author"].(string),
		}
	case "string":
		existingBlock = ExistingBlock{}
	}

	logsBloom, _ := hex.DecodeString(block.LogsBloom[2:])

	blockInsertData := insertData{
		"chain":             block.ChainId,
		"id":                block.Height,
		"hash":              withHexPrefix(block.Hash),
		"near_hash":         withHexPrefix(hex.EncodeToString(base58.Decode(existingBlock.NearHash))),
		"timestamp":         time.Unix(block.Timestamp/1000000000, 0),
		"size":              block.Size.toSqlValue(),
		"gas_limit":         block.GasLimit.toSqlValue(),
		"gas_used":          block.GasUsed.toSqlValue(),
		"parent_hash":       withHexPrefix(block.ParentHash),
		"transactions_root": withHexPrefix(block.TransactionsRoot),
		"state_root":        withHexPrefix(block.StateRoot),
		"receipts_root":     withHexPrefix(block.ReceiptsRoot),
		"logs_bloom":        logsBloom,
		"miner":             withHexPrefix(block.Miner),
		"author":            existingBlock.Author,
		"sequence":          block.Sequence,
	}

	return blockInsertData.sqlArgs("block")
}

type Transaction struct {
	Hash                 H256            `cbor:"hash"`       //H256
	BlockHash            H256            `cbor:"block_hash"` //H256
	BlockHeight          uint64          `cbor:"block_height"`
	ChainId              uint64          `cbor:"chain_id"`
	TransactionIndex     uint32          `cbor:"transaction_index"`
	From                 Address         `cbor:"from"`                     //Address
	To                   Address         `cbor:"to"`                       //Address
	Nonce                Uint256         `cbor:"nonce"`                    //U256
	GasPrice             Uint256         `cbor:"gas_price"`                //U256
	GasLimit             Uint256         `cbor:"gas_limit"`                //U256
	GasUsed              uint64          `cbor:"gas_used"`                 //U256
	MaxPriorityFeePerGas Uint256         `cbor:"max_priority_fee_per_gas"` //U256
	MaxFeePerGas         Uint256         `cbor:"max_fee_per_gas"`          //U256
	Value                Uint256         `cbor:"value"`                    //Wei
	Input                []byte          `cbor:"input"`                    //Vec<u8>
	Output               []byte          `cbor:"output"`                   //Vec<u8>
	AccessList           []AccessList    `cbor:"access_list"`              //Vec<AccessTuple>
	TxType               uint8           `cbor:"tx_type"`                  //u8
	Status               bool            `cbor:"bool"`                     //bool
	Logs                 []Log           `cbor:"logs"`                     //Vec<ResultLog>,
	ContractAddress      Address         `cbor:"contract_address"`         //Address
	V                    uint64          `cbor:"v"`                        //U64
	R                    Uint256         `cbor:"r"`                        //U256
	S                    Uint256         `cbor:"s"`                        //U256
	NearTransaction      NearTransaction `cbor:"near_metadata"`            // pub near_metadata: NearTransaction,
}

type AccessList struct {
	Address     Address `json:"address"`
	StorageKeys []H256  `json:"storageKeys"`
}

func (transaction Transaction) sqlInsertArgs(blockId uint64) insertArgs {
	var input []byte
	if len(transaction.Input) > 0 {
		input = transaction.Input
	}
	var output []byte
	if len(transaction.Output) > 0 {
		output = transaction.Output
	}

	transactionInsertData := insertData{
		"block":                    blockId,
		"index":                    transaction.TransactionIndex,
		"hash":                     withHexPrefix(transaction.Hash),
		"near_hash":                withHexPrefix(decodeBase58(transaction.NearTransaction.ReceiptHash)),
		"near_receipt_hash":        withHexPrefix(decodeBase58(transaction.NearTransaction.ReceiptHash)),
		"from":                     withHexPrefix(transaction.From),
		"to":                       withHexPrefix(transaction.To),
		"nonce":                    transaction.Nonce.toSqlValue(),
		"gas_price":                transaction.GasPrice.toSqlValue(),
		"gas_limit":                transaction.GasLimit.toSqlValue(),
		"gas_used":                 transaction.GasUsed,
		"value":                    transaction.Value.toSqlValue(),
		"input":                    input,
		"v":                        transaction.V,
		"r":                        transaction.R.toSqlValue(),
		"s":                        transaction.S.toSqlValue(),
		"status":                   transaction.Status,
		"output":                   output,
		"access_list":              transaction.AccessList,
		"max_fee_per_gas":          transaction.MaxFeePerGas.toSqlValue(),
		"max_priority_fee_per_gas": transaction.MaxPriorityFeePerGas.toSqlValue(),
		"type":                     transaction.TxType,
		"contract_address":         withHexPrefix(transaction.ContractAddress),
	}

	return transactionInsertData.sqlArgs("transaction")
}

type Log struct {
	Address Address  `cbor:"Address"`
	Topics  [][]byte `cbor:"Topics"`
	Data    []byte   `cbor:"data"`
}

func (log Log) sqlInsertArgs(transactionId uint64, index int) insertArgs {
	var data []byte
	if len(log.Data) > 0 {
		data = log.Data
	}
	var topics [][]byte
	for _, topic := range log.Topics {
		topics = append(topics, topic)
	}
	logInsertData := insertData{
		"transaction": transactionId,
		"index":       index,
		"data":        data,
		"from":        withHexPrefix(log.Address),
		"topics":      topics,
	}

	return logInsertData.sqlArgs("event")
}

type ExistingBlock struct {
	NearHash       string `cbor:"near_hash"`        //CryptoHash
	NearParentHash string `cbor:"near_parent_hash"` //CryptoHash
	Author         string `cbor:"author"`           //AuroraId
}

type NearTransaction struct {
	Hash        string `cbor:"hash"`         //Vec<AccessTuple>
	ReceiptHash string `cbor:"receipt_hash"` //Vec<AccessTuple>
}

func (data insertData) sqlArgs(column string) insertArgs {
	indexes := make([]string, 0, len(data))
	columns := make([]string, 0, len(data))
	values := make([]interface{}, 0, len(data))
	args := make(insertArgs, 0, len(data)+1)

	i := 0
	for k, v := range data {
		i++
		indexes = append(indexes, fmt.Sprintf("$%v", i))
		columns = append(columns, fmt.Sprintf("\"%v\"", k))
		values = append(values, v)
	}

	sql := fmt.Sprintf("INSERT INTO %v (%v) VALUES (%v) ON CONFLICT DO NOTHING RETURNING id", column, strings.Join(columns[:], ", "), strings.Join(indexes[:], ", "))
	args = append(args, sql)
	args = append(args, values...)
	return args
}

func withHexPrefix[T string | H256 | Address | byte | []byte](hash T) *string {
	str := string(hash)
	if len(str) > 0 {
		str = strings.Replace(str, "0x", "\\x", 1)
		if !strings.HasPrefix(str, "\\x") {
			str = "\\x" + str
		}
		return &str
	} else {
		return nil
	}
}

func decodeBase58(hash string) string {
	return hex.EncodeToString(base58.Decode(hash))
}
