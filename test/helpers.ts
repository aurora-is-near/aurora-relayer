/* This is free and unencumbered software released into the public domain. */

import { createApp } from '../src/app';
import { Engine } from '@aurora-is-near/engine';
import externalConfig from 'config';
import { Config } from '../src/config';
import os from 'os';
import pino from 'pino';

interface CreateServerProps {
  port?: number
  attachAppToPort?: boolean
}

export const createServer = async({port = 0, attachAppToPort = true} : CreateServerProps = {}) => {
  const logger = pino();
  const engine = await Engine.connect((externalConfig as unknown) as Config, {
    HOME: os.homedir(),
  })
  const app = await createApp(
    (externalConfig as unknown) as Config,
    logger,
    engine
  )

  if (attachAppToPort) {
    const server = app.listen(port)
    return server
  }

  return app
}
