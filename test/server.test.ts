/* This is free and unencumbered software released into the public domain. */

import { createApp } from '../src/app';
import { Engine } from '@aurora-is-near/engine'
import externalConfig from 'config';
import { Config } from '../src/config'

import pino from 'pino';
import request from 'supertest';

let app: Promise<any>

describe('AppServer', () => {
  beforeAll(async () => {
    const logger = pino();
    const engine = await Engine.connect(
      (externalConfig as unknown) as Config,
      {}
    );
    app = await createApp((externalConfig as unknown) as Config, logger, engine);
  })

  test('#viewBalance', async() => {
    const response = await request(app)
      .post('/')
      .send({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: ['0x702ed64ad1ed211a3cb3c4d7e8b5ca862f7527d6'],
      })

    expect(response.body.result).toEqual(`0x0`)
  });
});
