import { relations } from "drizzle-orm";
import { timestamp, pgTable, uuid, text, smallint, varchar } from "drizzle-orm/pg-core";

export const boards = pgTable("board", {
  id: uuid("id").primaryKey(),
  createdAt: timestamp("created_at"),
});

export const boardsRelations = relations(boards, ({ many }) => ({
  users: many(users),
}));

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: varchar("name"),
  boardId: uuid("board_id").notNull().references(() => boards.id),
  createdAt: timestamp("created_at"),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  board: one(boards, {
    fields: [users.boardId],
    references: [boards.id],
  }),
  cards: many(cards)
}));

export const cards = pgTable("cards", {
  id: uuid("id").primaryKey(),
  text: text("text"),
  boardId: uuid("board_id").notNull().references(() => boards.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  column: smallint("column"),
  createdAt: timestamp("created_at"),
});

export const cardsRelations = relations(cards, ({ one }) => ({
  board: one(boards, {
    fields: [cards.boardId],
    references: [boards.id],
  }),
  user: one(users, {
    fields: [cards.userId],
    references: [users.id],
  }),
}));
