import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { getDrizzleDB } from "./persistance/drizzle/drizzle.config";
import { DrizzleBoardRepo } from "./persistance/drizzle/DrizzleBoardRepo";
import { DrizzleUserRepo } from "./persistance/drizzle/DrizzleUserRepo";
import { DrizzleCardRepo } from "./persistance/drizzle/DrizzleCardRepo";
import type { PubSubGateway } from "./core/ports/PubSubGateway";
import { initElysiaRouter } from "./api/elysiaRouter";
import PubSub from "pubsub-js"

console.log("Initialize DB");
const drizzleDB: NodePgDatabase = await getDrizzleDB();

console.log('Create adapters')
const boardRepo = new DrizzleBoardRepo(drizzleDB)
const userRepo = new DrizzleUserRepo(drizzleDB)
const cardRepo = new DrizzleCardRepo(drizzleDB)

const pubSub: PubSubGateway = {
  publish: (channel, message) => {
    console.log("Publishing message", message, "to channel", channel);
    return PubSub.publish(channel || "board_updates", message);
  },
  subscribe: (channel, callback) => PubSub.subscribe(channel || "board_updates", (_, data) => callback(data))
}

console.log("Initialize router");
initElysiaRouter(boardRepo, userRepo, cardRepo, pubSub)

console.log("Hello from Bun!!!");
