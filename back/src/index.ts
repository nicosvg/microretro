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
import { DrizzleReactionRepo } from "./persistance/drizzle/DrizzleReactionRepo";

console.log("Initialize DB");
let drizzleDB: NodePgDatabase;
try {
  drizzleDB = await getDrizzleDB();
  // Check DB connection
  const res = await drizzleDB.execute(sql`SELECT 1`);
  if (res.rowCount === 1) {
    console.log("Connection to database successful");
  }
} catch (error) {
  console.error("Failed to connect to database:", error);
  process.exit(1);
}

console.log("Create adapters");
const boardRepo = new DrizzleBoardRepo(drizzleDB);
const userRepo = new DrizzleUserRepo(drizzleDB);
const cardRepo = new DrizzleCardRepo(drizzleDB);
const voteRepo = new DrizzleVoteRepo(drizzleDB);
const groupRepo = new DrizzleGroupRepo(drizzleDB);
const reactionRepo = new DrizzleReactionRepo(drizzleDB);
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
let server;
try {
  server = initElysiaRouter(
    boardRepo,
    userRepo,
    cardRepo,
    pubSub,
    voteRepo,
    groupRepo,
    reactionRepo,
    aiChat,
  );
  console.log("Server started successfully!");
  console.log(`Listening on ${server.server?.hostname || "0.0.0.0"}:${server.server?.port || process.env.PORT || "3000"}`);
} catch (error) {
  console.error("Failed to start server:", error);
  process.exit(1);
}
