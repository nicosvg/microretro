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
import { Events } from "@domain/event";
import { voteForCard } from "../core/usecases/voteForCard";
import type { VoteRepository } from "../core/ports/VoteRepository";
import Stream from "@elysiajs/stream";
import { updateCard } from "../core/usecases/updateCard";
import { deleteCard } from "../core/usecases/deleteCard";
import { goToPreviousState } from "../core/usecases/goToPreviousState";
import { generateBoardSummary } from "../core/usecases/generateBoardSummary";

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
  voteRepo: VoteRepository
) {
  new Elysia()
    .use(
      cors({
        origin: process.env.DOMAIN,
      })
    )
    .use(bearer())
    .use(jwtValidator)
    .post(
      "/ai",
      async ({ body, set }) => {
        const ollamaUrl = process.env.OLLAMA_API_ENDPOINT!;
        const ollamaApiKey = process.env.OLLAMA_API_KEY;

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (ollamaApiKey) {
          headers.Authorization = `Bearer ${ollamaApiKey}`;
        }

        const response = await fetch(ollamaUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: "qwen2.5:0.5b",
            messages: [{ role: "user", content: body.prompt }],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          set.status = response.status;
          return { error: errorData };
        }

        const data = await response.json();
        return data;
      },
      { body: t.Object({ prompt: t.String() }) }
    )
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
      }
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
          cardRepo
        );
        console.log("Created a new card", card);
        pubSub.publish(boardId, {
          event: Events.CREATED_CARD,
          payload: { card },
        });

        return { card: card };
      },
      { body: t.Object({ text: t.String(), column: t.Number() }) }
    )
    .put(
      "/boards/:boardId/cards/:cardId",
      async ({ body, params: { boardId, cardId }, set, jwt, bearer }) => {
        const profile = (await jwt.verify(bearer)) as UserProfile | false;
        if (!profile) {
          set.status = 401;
          return "Unauthorized";
        }

        const editedCard = body;
        if (boardId === undefined) {
          throw new Error("boardId is required");
        }
        if (cardId === undefined) {
          throw new Error("cardId is required");
        }
        const card = await updateCard(cardId, editedCard.text, cardRepo);
        console.log("Updated card", card);
        pubSub.publish(boardId, {
          event: Events.UPDATED_CARD,
          payload: { card },
        });

        return { card: card };
      },
      { body: t.Object({ text: t.String() }) }
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
      }
    )
    .post(
      "/boards/:boardId/previousState",
      async ({ params: { boardId }, set, jwt, bearer }) => {
        const profile = (await jwt.verify(bearer)) as UserProfile | false;
        if (!profile) {
          set.status = 401;
          return "Unauthorized";
        }

        if (boardId === undefined) {
          throw new Error("boardId is required");
        }

        const step = await goToPreviousState(boardRepo)(boardId);
        console.log("Going to previous state", step);
        pubSub.publish(boardId, {
          event: Events.CHANGED_STEP,
          payload: { step },
        });

        return { step };
      }
    )
    .post(
      "/boards/:boardId/cards/:cardId/vote",
      async ({ set, jwt, bearer, params: { boardId, cardId }, body }) => {
        const profile = (await jwt.verify(bearer)) as UserProfile | false;
        if (!profile) {
          set.status = 401;
          return "Unauthorized";
        }

        if (cardId === undefined) {
          throw new Error("cardId is required");
        }
        if (boardId === undefined) {
          throw new Error("boardId is required");
        }

        await voteForCard(voteRepo)(cardId, profile.id, body.value);
        pubSub.publish(boardId, {
          event: Events.VOTED_FOR_CARD,
          payload: { cardId, userId: profile.id, newValue: body.value },
        });
      },
      {
        body: t.Object({ value: t.Number() }),
      }
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
      }
    )
    // SSE are no longer used in the front-end
    .get("/sse", ({ query: { boardId } }) => {
      console.log("boardId", boardId);
      if (!boardId) {
        return;
      }
      return new Stream((stream) => {
        pubSub.subscribe(boardId, (data: any) => {
          console.debug("Sending message for board " + boardId, data);
          stream.send(data);
        });
      });
    })
    .delete(
      "/boards/:boardId/cards/:cardId",
      async ({ params: { boardId, cardId }, set, jwt, bearer }) => {
        const profile = (await jwt.verify(bearer)) as UserProfile | false;
        if (!profile) {
          set.status = 401;
          return "Unauthorized";
        }

        if (boardId === undefined) {
          throw new Error("boardId is required");
        }
        if (cardId === undefined) {
          throw new Error("cardId is required");
        }
        await deleteCard(cardRepo)(cardId);

        pubSub.publish(boardId, {
          event: Events.DELETED_CARD,
          payload: { cardId },
        });
      }
    )
    .ws("/ws/:boardId", {
      async beforeHandle({ jwt, query: { access_token } }) {
        const res = await jwt.verify(access_token);
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
        pubSub.subscribe(boardId, (data: any) => {
          console.debug("Sending message for board " + boardId, data);
          ws.send(JSON.stringify(data));
        });
      },
    })
    .post(
      "/boards/:boardId/summary",
      async ({ params: { boardId }, jwt, set, bearer }) => {
        const profile = (await jwt.verify(bearer)) as UserProfile | false;
        if (!profile) {
          set.status = 401;
          return "Unauthorized";
        }

        if (!boardId) {
          set.status = 400;
          return "Board ID is required";
        }

        try {
          console.log(`Generating summary for board: ${boardId}`);

          // Get the prompt from the usecase
          const prompt = await generateBoardSummary(boardId, boardRepo);
          console.log("Generated prompt successfully:", prompt);

          const ollamaUrl = process.env.OLLAMA_API_ENDPOINT;
          if (!ollamaUrl) {
            console.error(
              "OLLAMA_API_ENDPOINT environment variable is not set"
            );
            set.status = 500;
            return {
              success: false,
              error: "AI service configuration error",
            };
          }

          const ollamaApiKey = process.env.OLLAMA_API_KEY;
          console.log(`Using Ollama API at: ${ollamaUrl}`);

          const headers: HeadersInit = {
            "Content-Type": "application/json",
          };

          if (ollamaApiKey) {
            headers.Authorization = `Bearer ${ollamaApiKey}`;
          }

          console.log("Sending request to AI service...");
          const response = await fetch(`${ollamaUrl}/api/chat`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              model: "qwen2.5:0.5b",
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
              stream: false,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(
              `AI service response error: ${response.status}`,
              errorText
            );
            set.status = response.status;
            return {
              success: false,
              error: `AI service error: ${response.status}`,
              details: errorText,
            };
          }

          const data = await response.json();
          console.log("Received AI response successfully", data);

          if (!data.message?.content) {
            console.warn("AI response missing content", data);
          }

          return {
            success: true,
            summary: data.message?.content || "Could not generate summary",
          };
        } catch (error) {
          console.error("Error generating summary:", error);
          set.status = 500;
          return {
            success: false,
            error: "Failed to generate board summary",
            details: error instanceof Error ? error.message : String(error),
          };
        }
      }
    )
    .listen({ port: 3000 });
}
