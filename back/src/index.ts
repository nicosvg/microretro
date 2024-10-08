import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { initRouter } from "./api/router";
import { getDrizzleDB } from "./persistance/drizzle/drizzle.config";
import { DrizzleBoardRepo } from "./persistance/drizzle/DrizzleBoardRepo";
import { DrizzleUserRepo } from "./persistance/drizzle/DrizzleUserRepo";

console.log("Initialize DB");
const drizzleDB: NodePgDatabase = await getDrizzleDB();

console.log('Create adapters')
const boardRepo = new DrizzleBoardRepo(drizzleDB)
const userRepo = new DrizzleUserRepo(drizzleDB)

console.log("Initialize router");
const app = initRouter(boardRepo, userRepo);

console.log("Hello from Bun!!!");

export default app
