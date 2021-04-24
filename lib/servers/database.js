/* This is free and unencumbered software released into the public domain. */
import { SkeletonServer } from './skeleton.js';
import postgres from 'postgres';
export class DatabaseServer extends SkeletonServer {
    constructor(engine, provider, config) {
        super();
        this.engine = engine;
        this.provider = provider;
        this.config = config;
        this.sql = postgres(config.database);
    }
}
