import { SkeletonServer } from './skeleton.js';
import * as api from '../api.js';
import pg from 'pg';
export declare class DatabaseServer extends SkeletonServer {
    protected sql?: pg.Client;
    _init(): Promise<void>;
    eth_blockNumber(): Promise<api.Quantity>;
    eth_getFilterChanges(filterID: api.Quantity): Promise<api.LogObject[]>;
    eth_getFilterLogs(filterID: api.Quantity): Promise<api.LogObject[]>;
    eth_getLogs(filter: api.FilterOptions): Promise<api.LogObject[]>;
    eth_newBlockFilter(): Promise<api.Quantity>;
}
