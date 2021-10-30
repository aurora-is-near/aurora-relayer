// This is free and unencumbered software released into the public domain.

package near

type NEARSyncInfo struct {
	LatestBlockHeight int64  `json:"latest_block_height"`
	LatestBlockTime   string `json:"latest_block_time"`
}

type NEARStatus struct {
	ChainID               string       `json:"chain_id"`
	LatestProtocolVersion int          `json:"latest_protocol_version"`
	ProtocolVersion       int          `json:"protocol_version"`
	SyncInfo              NEARSyncInfo `json:"sync_info"`
}
