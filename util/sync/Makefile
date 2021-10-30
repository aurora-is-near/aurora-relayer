GO = go
GOFLAGS = -ldflags="-s -w"
UPX = upx
UPXFLAGS = --quiet --best --lzma

# The default target:

all: sync

.PHONY: all

# Output executables:

sync: main.go
	GOOS=linux GOARCH=amd64 $(GO) build $(GOFLAGS) -o $@ $< && $(UPX) $(UPXFLAGS) $@

# Rules for development:

clean:
	@rm -Rf sync *~

distclean: clean

mostlyclean: clean

maintainer-clean: clean

.PHONY: clean distclean mostlyclean maintainer-clean

.SECONDARY:
.SUFFIXES:
