import { SkeletonServer } from './skeleton.js';
import * as api from '../api.js';
export declare class DatabaseServer extends SkeletonServer {
    sql: any;
    _init(): Promise<void>;
    eth_getFilterChanges(filterID: api.Quantity): Promise<api.LogObject[]>;
    eth_newBlockFilter(): Promise<api.Quantity>;
}
