import { Hono } from "hono";
import { cors } from "hono/cors";
import { createBoard } from "../core/usecases/createBoard";
import { type BoardRepository } from "../core/ports/BoardRepository";
import type { Board } from "../core/domain/board";
import { getBoard } from "../core/usecases/getBoard";

export function initRouter(boardRepo: BoardRepository) {
  const app = new Hono();
  app.use('/*', cors());

  app.get('/', (c) => c.text('Hono!'));
  app.post('/boards', async (c) => {
    const id = await createBoard(boardRepo)
    return c.json({ id: id });
  });
  app.get('/board/:id', async (c) => {
    const boardId = c.req.param('id')
    const board: Board = await getBoard(boardId, boardRepo)
    return c.json(board);
  });
  return app
}
