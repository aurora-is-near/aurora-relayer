# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## 2021-12-01

Stored procedure needs to be reloaded [Issue #133](https://github.com/aurora-is-near/aurora-relayer/issues/133)

- `etc/schema/functions/eth_getTransactionReceipt.sql`


## 2021-10-19

Some schema changes were necessary in order to be able to index
[prehistory]. To update your existing schema, execute:

```sql
ALTER TABLE block ALTER COLUMN near_hash DROP NOT NULL;
ALTER TABLE block ALTER COLUMN timestamp DROP NOT NULL;
ALTER DOMAIN instant DROP CONSTRAINT instant_check;
ALTER DOMAIN instant ADD CONSTRAINT instant_check CHECK (value = timestamptz '1970-01-01T00:00:00Z' OR value > timestamptz '2015-07-30T00:00:00Z');
```

In addition, reload the following stored procedures:

- `etc/schema/functions/eth_getBlockByNumber.sql`

[prehistory]: https://github.com/aurora-is-near/aurora-relayer-dumps
