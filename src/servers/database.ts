/* This is free and unencumbered software released into the public domain. */

import { SkeletonServer } from './skeleton.js';

//import * as api from '../api.js';
import { Config } from '../config.js';
//import { unimplemented } from '../errors.js';
import { NearProvider } from '../provider.js';

//import { Address, BlockOptions, Engine, formatU256, hexToBase58, hexToBytes, intToHex } from '@aurora-is-near/engine';
import { Engine } from '@aurora-is-near/engine';
import postgres from 'postgres';

export class DatabaseServer extends SkeletonServer {
    public readonly sql: any;

    constructor(
            public readonly engine: Engine,
            public readonly provider: NearProvider,
            public readonly config: Config) {
        super();
        this.sql = postgres(config.database);
    }

    // TODO
}
