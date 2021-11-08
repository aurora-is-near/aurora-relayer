DROP TABLE IF EXISTS subscription CASCADE;

CREATE TABLE subscription (
	sec_websocket_key varchar COLLATE "default",
  id                varchar COLLATE "default",
	type              varchar COLLATE "default",
	ip                varchar COLLATE "default"
);

CREATE UNIQUE INDEX subscription_sec_websocket_key_type_index_idx ON subscription (sec_websocket_key, type);
