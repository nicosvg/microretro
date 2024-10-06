import { timestamp, pgTable, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("board", {
  id: uuid("id"),
  createdAt: timestamp("created_at"),
});
