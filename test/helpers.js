/* This is free and unencumbered software released into the public domain. */

import { createApp } from '../lib/app.js';
import { Engine } from '@aurora-is-near/engine';
import externalConfig from 'config';
import os from 'os';
import pino from 'pino';

export const createServer = async({port = 0, attachAppToPort = true} = {}) => {
  const logger = pino();
  const engine = await Engine.connect(externalConfig, {
    HOME: os.homedir(),
  })
  const app = await createApp(
    {
      ...externalConfig,
      getLogsLimit: 5,
    },
    logger,
    engine
  )

  if (attachAppToPort) {
    const server = app.listen(port)
    return server
  }

  return app
}
