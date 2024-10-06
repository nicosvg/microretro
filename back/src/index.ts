import { initRouter } from "./config/router";
import { getDrizzleDB } from "./persistance/drizzle/drizzle.config";


console.log("Initialize router");
initRouter();
console.log("Initialize DB");
const drizzleDB = await getDrizzleDB();

console.log("Hello via Bun!");
