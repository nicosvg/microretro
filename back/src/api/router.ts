import { Hono } from "hono";
import { cors } from "hono/cors";
import { createBoard } from "../core/usecases/createBoard";
import { type BoardRepository } from "../core/ports/BoardRepository";
import type { Board } from "../core/domain/board";
import { getBoard } from "../core/usecases/getBoard";
import type { UserRepository } from "../core/ports/UserRepository";
import { createCard } from "../core/usecases/createCard";
import type { CardRepository } from "../core/ports/CardRepository";

export function initRouter(boardRepo: BoardRepository, userRepo: UserRepository, cardRepo: CardRepository) {
  const app = new Hono();
  app.use('/*', cors());

  app.get('/', (c) => c.text('Hono!'));
  app.post('/boards', async (c) => {
    const id = await createBoard(boardRepo, userRepo)
    return c.json({ id: id });
  });
  app.get('/board/:id', async (c) => {
    const boardId = c.req.param('id')
    const board: Board = await getBoard(boardId, boardRepo)
    return c.json(board);
  });
  app.post('/boards/:boardId/cards', async (c) => {
    const body = await c.req.json()
    const text = body.text
    const boardId = c.req.param('boardId')
    if (boardId === undefined) {
      throw new Error('boardId is required')
    }
    const cardId = await createCard(boardId, '5ab0aebc-6e82-4ecb-9066-061153a5ddae', text, cardRepo)
    return c.json({ cardId: cardId });
  });
  return app
}
