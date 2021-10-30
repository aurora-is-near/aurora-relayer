// This is free and unencumbered software released into the public domain.

package main

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/cloudflare/cloudflare-go"
	"inet.af/netaddr"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "usage: ban IPADDR [LABEL]\n")
		os.Exit(64) // EX_USAGE
	}

	cfAPIToken := os.Getenv("CF_API_TOKEN")
	if cfAPIToken == "" {
		fmt.Fprintf(os.Stderr, "missing %s environment variable\n", "CF_API_TOKEN")
		os.Exit(78) // EX_CONFIG
	}

	cfAccountID := os.Getenv("CF_ACCOUNT_ID")
	if cfAccountID == "" {
		fmt.Fprintf(os.Stderr, "missing %s environment variable\n", "CF_ACCOUNT_ID")
		os.Exit(78) // EX_CONFIG
	}

	cfListID := os.Getenv("CF_LIST_ID")
	if cfListID == "" {
		fmt.Fprintf(os.Stderr, "missing %s environment variable\n", "CF_LIST_ID")
		os.Exit(78) // EX_CONFIG
	}

	ipAddress, err := netaddr.ParseIP(os.Args[1])
	if err != nil {
		fmt.Fprintf(os.Stderr, "%s", err)
		os.Exit(65) // EX_DATAERR
	}

	ipLabel := ""
	if len(os.Args) > 2 {
		ipLabel = os.Args[2]
	}

	api, err := cloudflare.NewWithAPIToken(cfAPIToken, cloudflare.UsingAccount(cfAccountID))
	if err != nil {
		fmt.Fprintf(os.Stderr, "%s", err)
		os.Exit(77) // EX_NOPERM
	}

	ctx := context.Background()
	_, err = api.CreateIPListItem(ctx, cfListID, ipToString(ipAddress), ipLabel)
	if err != nil {
		fmt.Fprintf(os.Stderr, "%s", err)
		os.Exit(69) // EX_UNAVAILABLE
	}
}

func ipToString(ip netaddr.IP) string {
	if ip.Is4() {
		return ip.String()
	}
	return strings.Join(strings.Split(ip.StringExpanded(), ":")[0:4], ":") + "::/64"
}
