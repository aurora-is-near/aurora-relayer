GO = go
GOFLAGS = -ldflags="-s -w"
UPX = upx
UPXFLAGS = --quiet --best --lzma

# The default target:

all: ban sync

.PHONY: all

# Output executables:

ban: ban.go
	GOOS=linux GOARCH=amd64 $(GO) build $(GOFLAGS) -o $@ $< && $(UPX) $(UPXFLAGS) $@

sync: sync.go
	GOOS=linux GOARCH=amd64 $(GO) build $(GOFLAGS) -o $@ $< && $(UPX) $(UPXFLAGS) $@

# Rules for development:

clean:
	@rm -Rf ban sync *~

distclean: clean

mostlyclean: clean

maintainer-clean: clean

.PHONY: clean distclean mostlyclean maintainer-clean

.SECONDARY:
.SUFFIXES:
