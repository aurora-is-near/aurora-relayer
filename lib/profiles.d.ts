import { Config } from './config.js';
import { BigNumber } from '@ethersproject/bignumber';
import { NatsConnection, JetStreamClient, Authenticator } from 'nats';
export interface Token {
    token?: string;
    email?: string;
    quota?: number;
    used?: number;
}
export interface ConnectOpts {
    servers: string;
    name?: string;
    authenticator?: Authenticator;
}
export declare class Profiles {
    readonly config: Config;
    protected nc?: NatsConnection;
    protected js?: JetStreamClient;
    constructor(config: Config);
    connect(): Promise<void>;
    startServer(): Promise<void>;
    addToken(token: string, payload: any): Promise<void>;
    signupKeys(token: string, payload: any): Promise<void>;
    tokenQuota(token: string): Promise<number>;
    getToken({ token, withUsedQuota }: {
        token: string;
        withUsedQuota?: boolean;
    }): Promise<Token>;
    usedQuota(token: string): Promise<number>;
    storeTransaction(token: string, key: string, gasPrice: BigNumber | undefined): Promise<void>;
    validateTransactionGasPrice(token: string, gasPrice: BigNumber | undefined): Promise<void>;
    quotaBucketName(token: string): string;
    tokenBucketName(): string;
}
