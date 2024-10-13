import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { initRouter } from "./api/router";
import { getDrizzleDB } from "./persistance/drizzle/drizzle.config";
import { DrizzleBoardRepo } from "./persistance/drizzle/DrizzleBoardRepo";
import { DrizzleUserRepo } from "./persistance/drizzle/DrizzleUserRepo";
import { DrizzleCardRepo } from "./persistance/drizzle/DrizzleCardRepo";
import type { PubSubGateway } from "./core/ports/PubSubGateway";

console.log("Initialize DB");
const drizzleDB: NodePgDatabase = await getDrizzleDB();

console.log('Create adapters')
const boardRepo = new DrizzleBoardRepo(drizzleDB)
const userRepo = new DrizzleUserRepo(drizzleDB)
const cardRepo = new DrizzleCardRepo(drizzleDB)

console.log('Initialize websocket server')
export const wsServer = Bun.serve<{ username: string }>({
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      console.log(`upgrade!`);
      // const username = getUsernameFromReq(req);
      const success = server.upgrade(req, { data: 'coucou' });
      return success
        ? undefined
        : new Response("WebSocket upgrade error", { status: 400 });
    }

    return new Response("Hello world");
  },
  websocket: {
    open(ws) {
      wsServer.publish("board_updates", JSON.stringify({ event: 'JOINED_BOARD', message: 'coucou' }))
      ws.subscribe("board_updates");
    },
    message() {
    },
    close(ws) {
      ws.unsubscribe("board_updates");
    },
  },
  port: 3001,
});

const pubSub: PubSubGateway = {
  //TODO: update with correct channel: boardId
  publish: (channel, message) => wsServer.publish("board_updates", JSON.stringify(message))
}

console.log("Initialize router");
const app = initRouter(boardRepo, userRepo, cardRepo, pubSub)

console.log("Hello from Bun!!!");

Bun.serve({
  fetch: app.fetch,
  port: 3000,
});

