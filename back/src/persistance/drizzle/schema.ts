import { BoardStep } from "@domain/board";
import { relations } from "drizzle-orm";
import {
  timestamp,
  pgTable,
  uuid,
  text,
  smallint,
  varchar,
  primaryKey,
  numeric,
  decimal,
  integer,
} from "drizzle-orm/pg-core";

export const boards = pgTable("board", {
  id: uuid("id").notNull().primaryKey(),
  createdAt: timestamp("created_at").notNull(),
  step: varchar("step").notNull().default(BoardStep.WRITE),
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
  cards: many(cards),
}));

export const cards = pgTable("cards", {
  id: uuid("id").primaryKey(),
  text: text("text"),
  boardId: uuid("board_id")
    .notNull()
    .references(() => boards.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
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
  "members",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    boardId: uuid("board_id")
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

export const votes = pgTable(
  "votes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    cardId: uuid("card_id")
      .notNull()
      .references(() => cards.id),
    votes: integer("votes").notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.cardId] }),
  }),
);

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey(),
  boardId: uuid("board_id")
    .notNull()
    .references(() => boards.id),
  title: text("title"),
});

export const groupsRelations = relations(groups, ({ many }) => ({
  votes: many(groupVotes),
}));


export const votesRelations = relations(votes, ({ one }) => ({
  board: one(cards, {
    fields: [votes.cardId],
    references: [cards.id],
  }),
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [votes.groupId],
    references: [groups.id],
  }),
}));

export const groupVotes = pgTable(
  "group_votes",
  {
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    votes: integer("votes").notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.groupId, t.userId] }),
  }),
);

export const groupVotesRelations = relations(groupVotes, ({ one }) => ({
  group: one(groups, {
    fields: [groupVotes.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupVotes.userId],
    references: [users.id],
  }),
}));
