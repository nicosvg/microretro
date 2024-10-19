import { createBoard } from "../core/usecases/createBoard";
import { type BoardRepository } from "../core/ports/BoardRepository";
import { getBoard } from "../core/usecases/getBoard";
import type { UserRepository } from "../core/ports/UserRepository";
import { createCard } from "../core/usecases/createCard";
import type { CardRepository } from "../core/ports/CardRepository";
import { createUser } from "../core/usecases/createUser";
import { PubSubEvent, type PubSubGateway } from "../core/ports/PubSubGateway";
import Elysia, { t } from "elysia";
import type { User } from "../core/domain/user";
import { cors } from '@elysiajs/cors'

const mockUserId = '5ab0aebc-6e82-4ecb-9066-061153a5ddae'

export function initElysiaRouter(boardRepo: BoardRepository, userRepo: UserRepository, cardRepo: CardRepository, pubSub: PubSubGateway) {
  new Elysia()
    .use(cors())

    .get('/', 'Hello Elysia!')

    .post('/boards', async () => {
      const id = await createBoard(boardRepo)()
      return { id: id };
    })

    .get('/boards/:id', async ({ params: { id } }) => {
      const boardId = id
      if (!boardId) { throw new Error('boardId is required') }
      console.log(boardId)
      const board = await getBoard(boardId, boardRepo)
      return board;
    })

    .post('/boards/:boardId/cards', async ({ body, params: { boardId } }) => {
      const text = body.text
      if (boardId === undefined) {
        throw new Error('boardId is required')
      }
      const card = await createCard(boardId, mockUserId, text, body.column, cardRepo)
      console.log('Created a new card', card)
      pubSub.publish(boardId, { event: PubSubEvent.CREATED_CARD, payload: { card } })
      return { card: card };
    }, { body: t.Object({ text: t.String(), column: t.Number() }) })

    .post('/users', async ({ body }) => {
      const userData = body
      const id = await createUser(userRepo)(userData as User)
      return { id: id };
    }, { body: t.Any() })

    .listen(3000);

  new Elysia()
    .ws('/ws/:boardId', {
      message(ws, message) {
        ws.send(message)
        console.log('received message', message)
      },
      open(ws) {
        const { boardId } = ws.data.params
        console.log('open socket')
        ws.send(JSON.stringify('Hello from server!, you are subscribed to board ' + boardId));
        pubSub.subscribe(boardId, (data: any) => {
          console.debug('Sending message for board ' + boardId, data)
          ws.send(JSON.stringify(data));
        })
      },
    })
    .listen(3001)
}


