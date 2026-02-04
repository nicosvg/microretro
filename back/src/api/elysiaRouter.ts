import { Events } from "@domain/event";
import type { User } from "@domain/user";
import bearer from "@elysiajs/bearer";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import Stream from "@elysiajs/stream";
import Elysia, { t } from "elysia";
import { join } from "path";
import type { AiChatPort } from "../core/ports/AiChatPort";
import { type BoardRepository } from "../core/ports/BoardRepository";
import type { CardRepository } from "../core/ports/CardRepository";
import type { GroupRepository } from "../core/ports/GroupRepository";
import type { PubSubGateway } from "../core/ports/PubSubGateway";
import type { UserRepository } from "../core/ports/UserRepository";
import type { VoteRepository } from "../core/ports/VoteRepository";
import type { ReactionRepository } from "../core/ports/ReactionRepository";
import { createBoard } from "../core/usecases/createBoard";
import { createCard } from "../core/usecases/createCard";
import { createUser } from "../core/usecases/createUser";
import { deleteCard } from "../core/usecases/deleteCard";
import { getBoard } from "../core/usecases/getBoard";
import { getUser } from "../core/usecases/getUser";
import { goToNextState } from "../core/usecases/goToNextState";
import { goToPreviousState } from "../core/usecases/goToPreviousState";
import { joinBoard } from "../core/usecases/joinBoard";
import { markUserReady } from "../core/usecases/markUserReady";
import { moveCardToGroup } from "../core/usecases/moveCardToGroup";
import { removeCardFromGroup } from "../core/usecases/removeCardFromGroup";
import { updateCard } from "../core/usecases/updateCard";
import { voteForCard } from "../core/usecases/voteForCard";
import { addReaction } from "../core/usecases/addReaction";
import { removeReaction } from "../core/usecases/removeReaction";
import { getReactionsByCards } from "../core/usecases/getReactionsByBoard";
import { isAllowedEmoji, toReactionDTO } from "@domain/reaction";
import { BoardStep } from "@domain/board";

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
  groupRepo: GroupRepository,
  reactionRepo: ReactionRepository,
  _aiChat: AiChatPort,
) {
  const app = new Elysia()
    .use(
      cors({
        origin: true, // Allow all origins
        credentials: true,
      }),
    )
    .use(bearer())
    .use(jwtValidator)
    .group("/api", (app) =>
      app
        .post("/boards", async ({ jwt, set, bearer, body }) => {
          const profile = (await jwt.verify(bearer)) as UserProfile | false;
          if (!profile) {
            set.status = 401;
            return "Unauthorized";
          }

          const { columnNames } = body as { columnNames?: string[] };
          const id = await createBoard(boardRepo)(profile.id, columnNames);
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
        .get("/boards/:boardId", async ({ params: { boardId }, jwt, set, bearer }) => {
          const profile = (await jwt.verify(bearer)) as UserProfile | false;
          if (!profile) {
            set.status = 401;
            return "Unauthorized";
          }

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
          { body: t.Object({ text: t.String() }) },
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
          },
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
          },
        )
        // Groups
        .post(
          "/boards/:boardId/groups",
          async ({ set, jwt, bearer, params: { boardId }, body }) => {
            const profile = (await jwt.verify(bearer)) as UserProfile | false;
            if (!profile) {
              set.status = 401;
              return "Unauthorized";
            }

            if (boardId === undefined) {
              throw new Error("boardId is required");
            }

            const sourceCardId = body.sourceCardId;
            const destinationCardId = body.destinationCardId;

            // call usecase
            await moveCardToGroup(groupRepo, cardRepo, pubSub)(
              boardId,
              sourceCardId,
              destinationCardId,
            );
          },
          {
            body: t.Object({
              sourceCardId: t.String(),
              destinationCardId: t.String(),
            }),
          },
        )
        .delete(
          "/boards/:boardId/groups/:groupId/cards/:cardId",
          async ({ set, jwt, bearer, params: { boardId, groupId, cardId } }) => {
            const profile = (await jwt.verify(bearer)) as UserProfile | false;
            if (!profile) {
              set.status = 401;
              return "Unauthorized";
            }

            if (boardId === undefined) {
              throw new Error("boardId is required");
            }
            if (groupId === undefined) {
              throw new Error("groupId is required");
            }
            if (cardId === undefined) {
              throw new Error("cardId is required");
            }

            // Call removeCardFromGroup use case (events are published inside)
            try {
              await removeCardFromGroup(cardRepo, groupRepo, pubSub)(
                boardId,
                cardId,
                groupId
              );
              return { success: true };
            } catch (error) {
              console.error(`Failed to remove card ${cardId} from group ${groupId}:`, error);
              set.status = 500;
              return { error: 'Failed to remove card from group' };
            }
          },
        )
        .post(
          "/boards/:boardId/cards/:cardId/reactions",
          async ({ set, jwt, bearer, params: { boardId, cardId }, body }) => {
            const profile = (await jwt.verify(bearer)) as UserProfile | false;
            if (!profile) {
              set.status = 401;
              return "Unauthorized";
            }

            if (!boardId || !cardId) {
              set.status = 400;
              return { error: "boardId and cardId are required" };
            }

            const { emoji } = body;

            // Validate emoji is in allowed set
            if (!isAllowedEmoji(emoji)) {
              set.status = 400;
              return { error: "Invalid emoji. Must be one of the allowed emojis." };
            }

            // Check board step - only allow reactions in PRESENT and DISCUSS steps
            const board = await getBoard(boardId, boardRepo);
            if (board.step !== BoardStep.PRESENT && board.step !== BoardStep.DISCUSS) {
              set.status = 403;
              return { error: "Reactions are only available in PRESENT and DISCUSS steps" };
            }

            try {
              // Add reaction (use case publishes event)
              const reaction = await addReaction(reactionRepo, pubSub)(
                boardId,
                cardId,
                emoji,
                profile.id
              );

              return {
                reaction: toReactionDTO(reaction, profile.id),
              };
            } catch (error) {
              console.error(`Failed to add reaction to card ${cardId}:`, error);
              set.status = 500;
              return { error: "Failed to add reaction" };
            }
          },
          {
            body: t.Object({ emoji: t.String() }),
          },
        )
        .delete(
          "/boards/:boardId/cards/:cardId/reactions",
          async ({ set, jwt, bearer, params: { boardId, cardId } }) => {
            const profile = (await jwt.verify(bearer)) as UserProfile | false;
            if (!profile) {
              set.status = 401;
              return "Unauthorized";
            }

            if (!boardId || !cardId) {
              set.status = 400;
              return { error: "boardId and cardId are required" };
            }

            try {
              // Remove reaction (use case publishes event)
              await removeReaction(reactionRepo, pubSub)(
                boardId,
                cardId,
                profile.id
              );

              return { success: true };
            } catch (error) {
              console.error(`Failed to remove reaction from card ${cardId}:`, error);
              set.status = 500;
              return { error: "Failed to remove reaction" };
            }
          },
        )
        .get(
          "/boards/:boardId/reactions",
          async ({ set, jwt, bearer, params: { boardId }, query }) => {
            const profile = (await jwt.verify(bearer)) as UserProfile | false;
            if (!profile) {
              set.status = 401;
              return "Unauthorized";
            }

            if (!boardId) {
              set.status = 400;
              return { error: "boardId is required" };
            }

            try {
              // Get board to fetch card IDs
              const board = await getBoard(boardId, boardRepo);
              const cardIds = board.cards.map((card: any) => card.id);

              // Get all reactions for the board's cards
              const reactions = await getReactionsByCards(reactionRepo)(cardIds);

              // Convert to DTOs for the current user
              const reactionDTOs = reactions.map(r => toReactionDTO(r, profile.id));

              return { reactions: reactionDTOs };
            } catch (error) {
              console.error(`Failed to get reactions for board ${boardId}:`, error);
              set.status = 500;
              return { error: "Failed to get reactions" };
            }
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
          },
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
          "/boards/:boardId/ready",
          async ({ params: { boardId }, body, set, jwt, bearer }) => {
            const profile = (await jwt.verify(bearer)) as UserProfile | false;
            if (!profile) {
              set.status = 401;
              return "Unauthorized";
            }

            if (boardId === undefined) {
              throw new Error("boardId is required");
            }

            await markUserReady(boardRepo)(boardId, profile.id, body.isReady);

            pubSub.publish(boardId, {
              event: body.isReady ? Events.USER_READY : Events.USER_UNREADY,
              payload: { userId: profile.id },
            });
          },
          {
            body: t.Object({ isReady: t.Boolean() }),
          },
        )
    )
    .get("*", async ({ path, set }) => {
      // Skip API routes - they're handled by the group above
      if (path.startsWith("/api")) {
        return;
      }

      // Try to serve static files first
      const publicPath = join(process.cwd(), "./public", path);
      const staticFile = Bun.file(publicPath);

      if (await staticFile.exists()) {
        // If it's a file with an extension, serve it
        if (path.includes(".")) {
          return staticFile;
        }
      }

      // SPA fallback - serve index.html for routes without file extensions
      if (!path.includes(".")) {
        const indexPath = join(process.cwd(), "./public/index.html");
        const indexFile = Bun.file(indexPath);
        if (await indexFile.exists()) {
          set.headers["Content-Type"] = "text/html";
          return indexFile;
        }
        return "Frontend not built. Please run 'npm run build' in the front directory.";
      }
    })
    .listen({ port: 3000, });

  return app;
}
