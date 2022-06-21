package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/aurora-is-near/borealis.go"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/nats-io/nats.go"
	"github.com/spf13/viper"
)

func main() {
	viper.AddConfigPath("config")
	viper.AddConfigPath("../../config")
	viper.SetConfigName("local")
	viper.SetConfigType("yaml")
	err := viper.ReadInConfig() // Find and read the config file
	if err != nil {             // Handle errors reading the config file
		panic(fmt.Errorf("Fatal error config file: %w \n", err))
	}

	var databaseURL = viper.GetString("database")
	var natsURL = viper.GetString("natsUrl")
	var natsCreds = viper.GetString("natsCreds")
	var natsChannel = viper.GetString("natsChannel")
	dbpool := DBConnection(databaseURL)
	defer dbpool.Close()

	natsClosed := make(chan error, 1)
	nc, err := nats.Connect(
		natsURL,
		nats.Name("relayer-nats-indexer"),
		nats.UserCredentials(natsCreds),
		nats.PingInterval(time.Second*5),
		nats.MaxPingsOutstanding(6),
		nats.Timeout(time.Second*10),
		nats.DisconnectErrHandler(func(c *nats.Conn, err error) {
			natsClosed <- err
		}),
	)
	if err != nil {
		panic(fmt.Errorf("Unable to connect to NATS server %s: %v\n", natsURL, err))
	}

	followChainHead(natsChannel, nc, dbpool)

	interrupt := make(chan os.Signal, 10)
	signal.Notify(interrupt, syscall.SIGHUP, syscall.SIGTERM, syscall.SIGQUIT, syscall.SIGABRT, syscall.SIGINT)

	select {
	case <-interrupt:
	case err := <-natsClosed:
		log.Printf("NATS closed: %v", err)
	}
}

func followChainHead(channel string, nc *nats.Conn, dbpool *pgxpool.Pool) {
	js, _ := nc.JetStream()
	cb := func(m *nats.Msg) {
		meta, _ := m.Metadata()
		// fmt.Printf("Stream seq: %s:%d, Consumer seq: %s:%d\n", meta.Stream, meta.Sequence.Stream, meta.Consumer, meta.Sequence.Consumer)

		rawEvent, err := decodeEvent(m.Data[:])
		if err != nil {
			fmt.Printf("Error: %+v\n", err)
		} else {
			block := *rawEvent.PayloadPtr
			block.Sequence = meta.Sequence.Stream
			blockId, error := Insert(dbpool, block)
			if error != nil {
				panic(fmt.Errorf("Unable import block %v: %v\n", blockId, error))
			} else {
				fmt.Println(blockId)
			}
		}
	}
	var sequence uint64
	_ = dbpool.QueryRow(context.Background(), `SELECT MAX(sequence) FROM block`).Scan(&sequence)
	_, err := js.Subscribe(channel, cb, nats.StartSequence(sequence+1), nats.ReplayInstant())

	if err != nil {
		panic(fmt.Errorf("Unable to subscribe to NATS server %v\n", err))
	}
}

func decodeEvent(msg []byte) (*borealis.TypedEvent[Block], error) {
	var rawEvent borealis.RawEvent
	paramsFactory := func(eventType borealis.EventType) any { p := Block{}; return &p }
	rawEvent.OverrideEventFactory(paramsFactory)
	err := rawEvent.DecodeCBOR(msg)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("Could not parse message: %s", msg))
	}
	event, _ := borealis.CheckRawEventTyped[Block](&rawEvent)
	return event, nil
}
