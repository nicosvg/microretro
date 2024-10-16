import { Hono } from "hono";
import { cors } from "hono/cors";
import { createBoard } from "../core/usecases/createBoard";
import { type BoardRepository } from "../core/ports/BoardRepository";
import { getBoard } from "../core/usecases/getBoard";
import type { UserRepository } from "../core/ports/UserRepository";
import { createCard } from "../core/usecases/createCard";
import type { CardRepository } from "../core/ports/CardRepository";
import { createUser } from "../core/usecases/createUser";
import { PubSubEvent, type PubSubGateway } from "../core/ports/PubSubGateway";

const mockUserId = '5ab0aebc-6e82-4ecb-9066-061153a5ddae'

export function initRouter(boardRepo: BoardRepository, userRepo: UserRepository, cardRepo: CardRepository, pubSub: PubSubGateway) {
  const app = new Hono();
  app.use('/*', cors());

  app.get('/', (c) => c.text('Hono!'));

  app.post('/boards', async (c) => {
    const id = await createBoard(boardRepo)()
    return c.json({ id: id });
  });

  app.get('/boards/:id', async (c) => {
    const boardId = c.req.param('id')
    if (!boardId) { throw new Error('boardId is required') }
    console.log(boardId)
    const board = await getBoard(boardId, boardRepo)
    return c.json(board);
  });

  app.post('/boards/:boardId/cards', async (c) => {
    const body = await c.req.json()
    const text = body.text
    const boardId = c.req.param('boardId')
    if (boardId === undefined) {
      throw new Error('boardId is required')
    }
    const cardId = await createCard(boardId, mockUserId, text, cardRepo)
    console.log('Created a new card', cardId)
    pubSub.publish(boardId, { event: PubSubEvent.CREATED_CARD, payload: { id: cardId, text } })
    return c.json({ cardId: cardId });
  });

  app.post('/users', async (c) => {
    const userData = await c.req.json()
    const id = await createUser(userRepo)(userData)
    return c.json({ id: id });
  });

  return app
}


