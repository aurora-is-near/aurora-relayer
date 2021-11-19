// This is free and unencumbered software released into the public domain.

package near

import (
	"context"

	"github.com/creachadair/jrpc2"
	"github.com/creachadair/jrpc2/jhttp"
)

type SyncInfo struct {
	LatestBlockHeight int64  `json:"latest_block_height"`
	LatestBlockTime   string `json:"latest_block_time"`
}

type Status struct {
	ChainID               string   `json:"chain_id"`
	LatestProtocolVersion int      `json:"latest_protocol_version"`
	ProtocolVersion       int      `json:"protocol_version"`
	SyncInfo              SyncInfo `json:"sync_info"`
}

type Client struct {
	channel *jhttp.Channel
	client  *jrpc2.Client
}

func NewClient(endpointURL string) *Client {
	channel := jhttp.NewChannel(endpointURL, nil)
	client := jrpc2.NewClient(channel, nil)
	return &Client{channel, client}
}

func (client *Client) GetBlockHeight(ctx context.Context) (int64, error) {
	status, err := client.GetStatus(ctx)
	if err != nil {
		return -1, err
	}
	return status.SyncInfo.LatestBlockHeight, nil
}

func (client *Client) GetStatus(ctx context.Context) (Status, error) {
	response, err := client.client.Call(ctx, "status", []string{})
	if err != nil {
		return Status{}, err
	}

	var status Status
	if err := response.UnmarshalResult(&status); err != nil {
		return Status{}, err
	}
	return status, nil
}
