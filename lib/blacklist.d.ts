export interface BlacklistConfig {
    IPs: Set<string>;
    EOAs: Set<string>;
    CAs: Set<string>;
}
export declare function blacklist(method: string): any;
