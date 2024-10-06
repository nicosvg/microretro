import { Hono } from "hono";
import { cors } from "hono/cors";

export function initRouter() {
  const app = new Hono();
  app.use('/*', cors());
  app.post('/boards', (c) => c.text('Created a new board! (Soon...)'));
  app.get('/', (c) => c.text('Hono!'));
}
