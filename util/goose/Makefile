GO = go
GOFLAGS = -ldflags="-s -w" -tags='no_sqlite3'

# The default target:

all: 
	GOBIN=`pwd` GOOS=linux GOARCH=amd64 CGO_ENABLED=0 $(GO) install $(GOFLAGS) github.com/pressly/goose/v3/cmd/goose@latest

.PHONY: all


# Rules for development:

clean:
	@rm -f goose

distclean: clean

mostlyclean: clean

maintainer-clean: clean

.PHONY: clean distclean mostlyclean maintainer-clean

.SECONDARY:
.SUFFIXES:
