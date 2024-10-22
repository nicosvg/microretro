import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/persistance/drizzle/schema.ts",
  out: "src/persistance/drizzle/migrations",
  dbCredentials: {
    host: "116.203.211.97",
    port: 5432,
    user: "postgres",
    password: process.env.DB_PASSWORD,
    database: "microretro",
    ssl: false
  }
});

async function initDrizzleClient() {
  const client = new Client({
    host: "116.203.211.97",
    port: 5432,
    user: "postgres",
    password: process.env.DB_PASSWORD,
    database: "microretro",
  });
  await client.connect();
  return client;
}

export async function getDrizzleDB() {
  const client = await initDrizzleClient()
  return drizzle(client, { logger: true })
}
