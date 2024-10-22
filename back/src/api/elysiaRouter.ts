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
import { jwt } from '@elysiajs/jwt'
import bearer from "@elysiajs/bearer";
import { joinBoard } from "../core/usecases/joinBoard";
import { getUser } from "../core/usecases/getUser";

interface UserProfile {
  id: string
  name: string
}

const jwtValidator = jwt({
  name: 'jwt',
  secret: '5ab0aebc-6e82-4ecb-9065-061153a5ddae'
})

export function initElysiaRouter(boardRepo: BoardRepository, userRepo: UserRepository, cardRepo: CardRepository, pubSub: PubSubGateway) {
  new Elysia()
    .use(cors())
    .use(bearer())
    .use(jwtValidator)
    .get('/', 'Hello Elysia!')

    .post('/boards', async ({ jwt, set, bearer }) => {
      const profile = await jwt.verify(bearer) as UserProfile | false
      if (!profile) {
        set.status = 401
        return 'Unauthorized'
      }

      const id = await createBoard(boardRepo)(profile.id)
      return { id: id };
    })

    .post('/boards/:boardId/join', async ({ params: { boardId }, jwt, set, bearer }) => {
      const profile = await jwt.verify(bearer) as UserProfile | false
      if (!profile) {
        set.status = 401
        return 'Unauthorized'
      }

      await joinBoard(boardRepo)(boardId, profile.id)
      const user = await getUser(userRepo)(profile.id)

      pubSub.publish(boardId, { event: PubSubEvent.JOINED_BOARD, payload: { user: user } })
    })

    .get('/boards/:id', async ({ params: { id }, jwt, set, bearer }) => {
      const profile = await jwt.verify(bearer) as UserProfile | false
      if (!profile) {
        set.status = 401
        return 'Unauthorized'
      }

      const boardId = id
      if (!boardId) { throw new Error('boardId is required') }
      const board = await getBoard(boardId, boardRepo)
      return board;
    })

    .post('/boards/:boardId/cards', async ({ body, params: { boardId }, set, jwt, bearer }) => {
      const profile = await jwt.verify(bearer) as UserProfile | false
      if (!profile) {
        set.status = 401
        return 'Unauthorized'
      }

      const text = body.text
      if (boardId === undefined) {
        throw new Error('boardId is required')
      }
      const card = await createCard(boardId, profile.id, text, body.column, cardRepo)
      console.log('Created a new card', card)
      pubSub.publish(boardId, { event: PubSubEvent.CREATED_CARD, payload: { card } })

      return { card: card };
    }, { body: t.Object({ text: t.String(), column: t.Number() }) })

    .post('/users', async ({ body, jwt }) => {
      const userData = body
      const createdUserId = await createUser(userRepo)(userData as User)
      const token = await jwt.sign({ name: userData.name, id: createdUserId })
      return { id: createdUserId, token };
    }, {
      body: t.Object({ name: t.String() }),
    })

    .listen({ port: 3000 });

  new Elysia()
    .use(jwtValidator)
    .ws('/ws/:boardId', {
      async beforeHandle({ jwt, query: { access_token } }) {
        const res = await jwt.verify(access_token)
        // __AUTO_GENERATED_PRINT_VAR_START__
        console.log("initElysiaRouter#beforeHandle res ", res); // __AUTO_GENERATED_PRINT_VAR_END__
        if (!res) {
          throw new Error('Unauthorized')
        }
      },
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


