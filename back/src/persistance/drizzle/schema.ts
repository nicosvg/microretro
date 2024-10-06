import { timestamp, pgTable, uuid } from "drizzle-orm/pg-core";

export const Board = pgTable("board", {
  id: uuid("id"),
  createdAt: timestamp("created_at"),
});
