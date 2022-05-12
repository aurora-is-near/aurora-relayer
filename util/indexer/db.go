package main

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
)

func DBConnection(databaseURL string) *pgxpool.Pool {
	pgpool, err := pgxpool.Connect(context.Background(), databaseURL)
	if err != nil {
		panic(fmt.Errorf("Unable to connect to database %s: %v\n", databaseURL, err))
	}
	return pgpool
}

func Insert(pgpool *pgxpool.Pool, block Block) (uint64, error) {
	tx, err := pgpool.Begin(context.Background())
	if err != nil {
		panic(err)
	}

	err = insertBlock(tx, block)
	if err != nil {
		return block.Height, err
	}

	for _, transaction := range block.Transactions {
		transactionId, err := insertTransaction(tx, transaction, block.Height)
		if err != nil {
			return block.Height, err
		}

		for index, log := range transaction.Logs {
			err := insertLog(tx, log, transactionId, index)
			if err != nil {
				return block.Height, err
			}
		}
	}

	err = tx.Commit(context.Background())
	if err != nil {
		return block.Height, rollback(tx, err)
	}
	return block.Height, nil
}

func insertBlock(tx pgx.Tx, block Block) error {
	args := block.sqlInsertArgs()
	_, err := tx.Exec(context.Background(), args[0].(string), args[1:]...)

	if err != nil {
		fmt.Printf("Received a block: %v\n", err)
		return rollback(tx, err)
	}
	return nil
}

func insertTransaction(tx pgx.Tx, transaction Transaction, blockId uint64) (uint64, error) {
	var transactionId uint64
	args := transaction.sqlInsertArgs(blockId)
	err := tx.QueryRow(context.Background(), args[0].(string), args[1:]...).Scan(&transactionId)

	if err != nil {
		if err.Error() != "no rows in result set" {
			return 0, rollback(tx, err)
		}
		fmt.Printf("Received a transaction: %+v\n", err)
	}
	return transactionId, nil
}

func insertLog(tx pgx.Tx, log Log, transactionId uint64, index int) error {
	args := log.sqlInsertArgs(transactionId, index)
	_, err := tx.Exec(context.Background(), args[0].(string), args[1:]...)
	if err != nil {
		fmt.Printf("Received a log: %v\n", err)
		return rollback(tx, err)
	}
	return nil
}

func rollback(tx pgx.Tx, originalErr error) error {
	rollbackErr := tx.Rollback(context.Background())
	if rollbackErr != nil {
		return fmt.Errorf("Unable to rollback transaction %v\n", rollbackErr)
	}
	return originalErr
}
