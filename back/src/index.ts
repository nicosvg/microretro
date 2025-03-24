import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { getDrizzleDB } from "./persistance/drizzle/drizzle.config";
import { DrizzleBoardRepo } from "./persistance/drizzle/DrizzleBoardRepo";
import { DrizzleUserRepo } from "./persistance/drizzle/DrizzleUserRepo";
import { DrizzleCardRepo } from "./persistance/drizzle/DrizzleCardRepo";
import type { PubSubGateway } from "./core/ports/PubSubGateway";
import { initElysiaRouter } from "./api/elysiaRouter";
import PubSub from "pubsub-js";
import { DrizzleVoteRepo } from "./persistance/drizzle/DrizzleVoteRepo";
import { sql } from "drizzle-orm";
import { OllamaAiChat } from "./ai/ollamaVpsAIChat";
import { DrizzleGroupRepo } from "./persistance/drizzle/DrizzleGroupRepo";

console.log("Initialize DB");
const drizzleDB: NodePgDatabase = await getDrizzleDB();
// Check DB connection
const res = await drizzleDB.execute(sql`SELECT 1`);
if (res.rowCount === 1) {
  console.log("Connection to database succesful");
}

console.log("Create adapters");
const boardRepo = new DrizzleBoardRepo(drizzleDB);
const userRepo = new DrizzleUserRepo(drizzleDB);
const cardRepo = new DrizzleCardRepo(drizzleDB);
const voteRepo = new DrizzleVoteRepo(drizzleDB);
const groupRepo = new DrizzleGroupRepo(drizzleDB);
const aiChat = new OllamaAiChat();

const pubSub: PubSubGateway = {
  publish: (channel, message) => {
    console.log("Publishing message", message, "to channel", channel);
    return PubSub.publish(channel || "board_updates", message);
  },
  subscribe: (channel, callback) =>
    PubSub.subscribe(channel || "board_updates", (_, data) => callback(data)),
};

console.log("Initialize router");
initElysiaRouter(
  boardRepo,
  userRepo,
  cardRepo,
  pubSub,
  voteRepo,
  groupRepo,
  aiChat,
);

console.log("Hello from Bun!!!");
