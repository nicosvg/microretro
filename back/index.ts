console.log("Hello via Bun!");

import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/*', cors({
  origin: 'http://localhost:5173/',
  allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}))

app.post('/boards', (c) => c.text('Created a new board! (Soon...)'))
app.get('/', (c) => c.text('Hono!'))

export default app
