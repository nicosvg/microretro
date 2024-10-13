import { relations } from "drizzle-orm";
import { timestamp, pgTable, uuid, text, smallint, varchar, primaryKey } from "drizzle-orm/pg-core";

export const boards = pgTable("board", {
  id: uuid("id").notNull().primaryKey(),
  createdAt: timestamp("created_at").notNull(),
});

export const boardsRelations = relations(boards, ({ many }) => ({
  users: many(users),
  cards: many(cards),
}));

export const users = pgTable("users", {
  id: uuid("id").notNull().primaryKey(),
  name: varchar("name").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  boards: many(boards),
  cards: many(cards)
}));

export const cards = pgTable("cards", {
  id: uuid("id").primaryKey(),
  text: text("text"),
  boardId: uuid("board_id").notNull().references(() => boards.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  column: smallint("column"),
  createdAt: timestamp("created_at").notNull(),
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

// Association table between users and boards
export const members = pgTable(
  'members',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    boardId: uuid('board_id')
      .notNull()
      .references(() => boards.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.boardId] }),
  }),
);

export const membersRelations = relations(members, ({ one }) => ({
  board: one(boards, {
    fields: [members.boardId],
    references: [boards.id],
  }),
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
}));
