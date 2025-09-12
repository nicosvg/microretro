import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { defineConfig } from "drizzle-kit";

const DB_HOST = process.env.DB_HOST || "116.203.211.97";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/persistance/drizzle/schema.ts",
  out: "src/persistance/drizzle/migrations",
  dbCredentials: {
    host: DB_HOST,
    port: 5432,
    user: "postgres",
    password: process.env.DB_PASSWORD,
    database: "microretro",
    ssl: false,
  },
});

async function _initDrizzleClient() {
  const client = new Client({
    host: DB_HOST,
    port: 5432,
    user: "postgres",
    password: process.env.DB_PASSWORD,
    database: "microretro",
    keepAlive: true,
  });
  await client.connect();
  return client;
}

export async function getDrizzleDB() {
  // const client = await initDrizzleClient();
  const connectionString = `postgresql://postgres:${process.env.DB_PASSWORD}@${DB_HOST}:5432/microretro`;
  return drizzle(connectionString, { logger: true });
}
