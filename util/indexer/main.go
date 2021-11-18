// This is free and unencumbered software released into the public domain.

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/aurora-is-near/near-api-go"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

const version = "0.0.0"
const timeFormat = "2006-01-02T15:04:05Z"

var configFile string
var verbose, debug bool
var databaseURL, endpointURL string
var queue = CreateQueue()

func main() {
	cobra.OnInitialize(initConfig)
	rootCmd.PersistentFlags().StringVar(&configFile, "config", "", "config file (default is config/local.yaml)")
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "Be verbose.")
	rootCmd.PersistentFlags().BoolVarP(&debug, "debug", "d", false, "Enable debugging.")
	cobra.CheckErr(rootCmd.Execute())
}

func initConfig() {
	if configFile != "" {
		viper.SetConfigFile(configFile)
	} else {
		viper.SetConfigName("local") // TODO: NEAR_ENV
		viper.SetConfigType("yaml")
		viper.AddConfigPath("config")
		viper.AddConfigPath("../../config")
	}

	viper.AutomaticEnv() // read in environment variables that match

	if err := viper.ReadInConfig(); err == nil {
		fmt.Fprintln(os.Stderr, "Using config file:", viper.ConfigFileUsed())
	}
}

var rootCmd = &cobra.Command{
	Use:     "indexer",
	Short:   "Produces block numbers to be indexed, prioritized by freshness",
	Long:    `Produces block numbers to be indexed, prioritized by freshness.`,
	Version: version,
	Run: func(cmd *cobra.Command, args []string) {
		databaseURL = viper.GetString("database")
		endpointURL = viper.GetString("endpoint")

		database, err := pgxpool.Connect(context.Background(), databaseURL)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Unable to connect to database %s: %v\n", databaseURL, err)
			os.Exit(1)
		}
		defer database.Close()

		endpoint := near.NewConnection(endpointURL)

		indexedBlockID, err := getIndexedBlockHeight(database)
		if err != nil {
			panic(err)
		}

		currentBlockID, err := getCurrentBlockHeight(endpoint)
		if err != nil {
			panic(err)
		}

		fmt.Fprintf(os.Stderr, "Indexing blocks #%d..#%d and #%d+...\n", currentBlockID, indexedBlockID, currentBlockID+1)

		go followChainHead(currentBlockID)
		go scanForIndexGaps(currentBlockID)
		for {
			blockID := queue.Dequeue()
			if blockID == -1 {
				time.Sleep(100 * time.Millisecond)
				continue
			}
			fmt.Println(blockID)
		}
	},
}

func followChainHead(previousBlockID int64) {
	endpoint := near.NewConnection(endpointURL)
	for {
		currentBlockID, err := getCurrentBlockHeight(endpoint)
		if err != nil {
			panic(err)
		}
		if currentBlockID > previousBlockID { // forward only
			for blockID := previousBlockID + 1; blockID <= currentBlockID; blockID++ {
				if verbose || debug {
					if blockID < currentBlockID {
						fmt.Fprintf(os.Stderr, "Enqueued skipped block #%d.\n", blockID)
					} else {
						fmt.Fprintf(os.Stderr, "Enqueued current block #%d.\n", blockID)
					}
				}
				queue.Enqueue(blockID)
			}
			previousBlockID = currentBlockID
		}
		time.Sleep(100 * time.Millisecond)
	}
}

func scanForIndexGaps(tipBlockID int64) {
	windowSize := int64(1000) // TODO: make this configurable
	database, err := pgxpool.Connect(context.Background(), databaseURL)
	if err != nil {
		panic(err)
	}
	defer database.Close()
	for i := int64(0); i < 10000; i++ {
		maxBlockID := tipBlockID - i*windowSize
		minBlockID := maxBlockID - windowSize + 1
		if minBlockID < 0 {
			break
		}
		if debug {
			fmt.Fprintf(os.Stderr, "Scanning blocks #%d..#%d for gaps...\n", minBlockID, maxBlockID)
		}
		query := fmt.Sprintf(`SELECT ids AS "id"
			FROM generate_series(%d, %d, 1) ids
			LEFT JOIN block ON ids = block.id
			WHERE block.id IS NULL
			ORDER BY block.id DESC
			LIMIT %d`, minBlockID, maxBlockID, windowSize)
		rows, err := database.Query(context.Background(), query)
		if err != nil {
			panic(err)
		}
		for rows.Next() {
			var blockID int64
			err := rows.Scan(&blockID)
			if err != nil {
				panic(err)
			}
			if verbose || debug {
				fmt.Fprintf(os.Stderr, "Enqueued missing block #%d.\n", blockID)
			}
			queue.Enqueue(blockID)
		}
		rows.Close()
		time.Sleep(100 * time.Millisecond)
	}
}

func getIndexedBlockHeight(database *pgxpool.Pool) (int64, error) {
	var blockID int64
	err := database.QueryRow(context.Background(),
		"SELECT MAX(id) FROM block").Scan(&blockID)
	if err != nil {
		return -1, err
	}
	return blockID, nil
}

func getCurrentBlockHeight(endpoint *near.Connection) (int64, error) {
	nodeStatus, err := endpoint.GetNodeStatus()
	if err != nil {
		return -1, err
	}
	syncInfo := nodeStatus["sync_info"].(map[string]interface{})
	blockID, err := syncInfo["latest_block_height"].(json.Number).Int64()
	if err != nil {
		return -1, err
	}
	return blockID, nil
}
