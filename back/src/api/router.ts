import { Hono } from "hono";
import { cors } from "hono/cors";
import { createBoard } from "../core/usecases/createBoard";
import { type BoardRepository } from "../core/ports/BoardRepository";

export function initRouter(boardRepo: BoardRepository) {
  const app = new Hono();
  app.use('/*', cors());

  app.get('/', (c) => c.text('Hono!'));
  app.post('/boards', async (c) => {
    const id = await createBoard(boardRepo)
    return c.text(`Created a new board! (Soon...) id=${id}`);
  });
  return app
}
