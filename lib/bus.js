/* This is free and unencumbered software released into the public domain. */
import nats from 'nats';
const codec = nats.JSONCodec();
export class Bus {
    constructor(config) {
        this.config = config;
        this._init();
    }
    async _init() {
        this.broker = await nats.connect({ servers: this.config.broker });
    }
    async publishError(method, ip, code) {
        if (!ip)
            return;
        this.broker?.publish(`error.${method}`, codec.encode({ method, ip, code }));
    }
}
