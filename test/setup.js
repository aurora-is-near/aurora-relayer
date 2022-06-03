import { createServer } from './helpers.js'

const setup = async() => {
  const app = await createServer()
  const port = app.address().port
  process.env.EXPRESS_PORT = port
}

export default setup
