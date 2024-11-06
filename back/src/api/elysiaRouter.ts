import { createBoard } from "../core/usecases/createBoard";
import { type BoardRepository } from "../core/ports/BoardRepository";
import { getBoard } from "../core/usecases/getBoard";
import type { UserRepository } from "../core/ports/UserRepository";
import { createCard } from "../core/usecases/createCard";
import type { CardRepository } from "../core/ports/CardRepository";
import { createUser } from "../core/usecases/createUser";
import Elysia, { t } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import { joinBoard } from "../core/usecases/joinBoard";
import { getUser } from "../core/usecases/getUser";
import { goToNextState } from "../core/usecases/goToNextState";
import type { User } from "@domain/user";
import type { PubSubGateway } from "../core/ports/PubSubGateway";
import { Events } from "@domain/Events";
import { voteForCard } from "../core/usecases/voteForCard";
import type { VoteRepository } from "../core/ports/VoteRepository";

interface UserProfile {
  id: string;
  name: string;
}

const jwtValidator = jwt({
  name: "jwt",
  secret: "5ab0aebc-6e82-4ecb-9065-061153a5ddae",
});

export function initElysiaRouter(
  boardRepo: BoardRepository,
  userRepo: UserRepository,
  cardRepo: CardRepository,
  pubSub: PubSubGateway,
  voteRepo: VoteRepository,
) {
  new Elysia()
    .use(cors())
    .use(bearer())
    .use(jwtValidator)
    .get("/", "Hello Elysia!")

    .post("/boards", async ({ jwt, set, bearer }) => {
      const profile = (await jwt.verify(bearer)) as UserProfile | false;
      if (!profile) {
        set.status = 401;
        return "Unauthorized";
      }

      const id = await createBoard(boardRepo)(profile.id);
      return { id: id };
    })
    .post(
      "/boards/:boardId/join",
      async ({ params: { boardId }, jwt, set, bearer }) => {
        const profile = (await jwt.verify(bearer)) as UserProfile | false;
        if (!profile) {
          set.status = 401;
          return "Unauthorized";
        }

        await joinBoard(boardRepo)(boardId, profile.id);
        const user = await getUser(userRepo)(profile.id);

        pubSub.publish(boardId, {
          event: Events.JOINED_BOARD,
          payload: { user: user },
        });
      },
    )
    .get("/boards/:id", async ({ params: { id }, jwt, set, bearer }) => {
      const profile = (await jwt.verify(bearer)) as UserProfile | false;
      if (!profile) {
        set.status = 401;
        return "Unauthorized";
      }

      const boardId = id;
      if (!boardId) {
        throw new Error("boardId is required");
      }
      const board = await getBoard(boardId, boardRepo);
      return board;
    })
    .post(
      "/boards/:boardId/cards",
      async ({ body, params: { boardId }, set, jwt, bearer }) => {
        const profile = (await jwt.verify(bearer)) as UserProfile | false;
        if (!profile) {
          set.status = 401;
          return "Unauthorized";
        }

        const text = body.text;
        if (boardId === undefined) {
          throw new Error("boardId is required");
        }
        const card = await createCard(
          boardId,
          profile.id,
          text,
          body.column,
          cardRepo,
        );
        console.log("Created a new card", card);
        pubSub.publish(boardId, {
          event: Events.CREATED_CARD,
          payload: { card },
        });

        return { card: card };
      },
      { body: t.Object({ text: t.String(), column: t.Number() }) },
    )
    .post(
      "/boards/:boardId/nextState",
      async ({ params: { boardId }, set, jwt, bearer }) => {
        const profile = (await jwt.verify(bearer)) as UserProfile | false;
        if (!profile) {
          set.status = 401;
          return "Unauthorized";
        }

        if (boardId === undefined) {
          throw new Error("boardId is required");
        }

        const step = await goToNextState(boardRepo)(boardId);
        console.log("Going to next state", step);
        pubSub.publish(boardId, {
          event: Events.CHANGED_STEP,
          payload: { step },
        });

        return { step };
      },
    )
    .post(
      "/cards/:cardId/vote",
      async ({ set, jwt, bearer, params: { cardId }, body }) => {
        const profile = (await jwt.verify(bearer)) as UserProfile | false;
        if (!profile) {
          set.status = 401;
          return "Unauthorized";
        }

        if (cardId === undefined) {
          throw new Error("cardId is required");
        }

        await voteForCard(voteRepo)(cardId, profile.id, body.value);
      },
      {
        body: t.Object({ value: t.Number() }),
      },
    )
    .post(
      "/users",
      async ({ body, jwt }) => {
        const userData = body;
        const createdUserId = await createUser(userRepo)(userData as User);
        const token = await jwt.sign({
          name: userData.name,
          id: createdUserId,
        });
        return { id: createdUserId, token };
      },
      {
        body: t.Object({ name: t.String() }),
      },
    )
    .listen({ port: 3000 });

  new Elysia()
    .use(jwtValidator)
    .ws("/ws/:boardId", {
      async beforeHandle({ jwt, query: { access_token } }) {
        const res = await jwt.verify(access_token);
        // __AUTO_GENERATED_PRINT_VAR_START__
        console.log("initElysiaRouter#beforeHandle res ", res); // __AUTO_GENERATED_PRINT_VAR_END__
        if (!res) {
          throw new Error("Unauthorized");
        }
      },
      message(ws, message) {
        ws.send(message);
        console.log("received message", message);
      },
      open(ws) {
        const { boardId } = ws.data.params;
        console.log("open socket");
        ws.send(
          JSON.stringify(
            "Hello from server!, you are subscribed to board " + boardId,
          ),
        );
        pubSub.subscribe(boardId, (data: any) => {
          console.debug("Sending message for board " + boardId, data);
          ws.send(JSON.stringify(data));
        });
      },
    })
    .listen(3001);
}
