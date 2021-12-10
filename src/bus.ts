/* This is free and unencumbered software released into the public domain. */

import { Config } from './config.js';

import nats from 'nats';

const codec = nats.JSONCodec();

export class Bus {
  protected broker?: nats.NatsConnection;

  constructor(public readonly config: Config) {
    this._init();
  }

  protected async _init(): Promise<void> {
    this.broker = await nats.connect({ servers: this.config.broker });
  }

  async publishError(method: string, ip: string, code?: string): Promise<void> {
    if (!ip) return;
    this.broker?.publish(`error.${method}`, codec.encode({ method, ip, code }));
  }
}
