import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

const client = new Client({
  host: "116.203.211.97",
  port: 5432,
  user: "postgres",
  password: process.env.DB_PASSWORD,
  database: "microretro",
});
await client.connect();
export const db = drizzle(client);


