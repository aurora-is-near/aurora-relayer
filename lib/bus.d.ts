import { Config } from './config.js';
import nats from 'nats';
export declare class Bus {
    readonly config: Config;
    protected broker?: nats.NatsConnection;
    constructor(config: Config);
    protected _init(): Promise<void>;
    publishError(method: string, ip: string, code?: string): Promise<void>;
}
