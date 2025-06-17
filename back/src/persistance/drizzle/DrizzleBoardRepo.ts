import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { BoardRepository } from "../../core/ports/BoardRepository";
import { boards, cards, groups, members, users, votes } from "./schema";
import { v4 as uuidv4 } from "uuid";
import { eq, and, inArray } from "drizzle-orm";
import { BoardStep, type Board, type BoardId } from "@domain/board";
import type { Card } from "@domain/card";
import type { User, UserId } from "@domain/user";
import type { Group, GroupId } from "@domain/group";

export class DrizzleBoardRepo implements BoardRepository {
  constructor(private db: NodePgDatabase) { }
  async updateBoard(board: Board): Promise<void> {
    await this.db.update(boards).set(board).where(eq(boards.id, board.id));
  }

  async getBoard(boardId: BoardId): Promise<Board> {
    const board = await this.db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId));
    const res: Board = {
      id: board[0].id,
      createdAt: board[0].createdAt,
      cards: [],
      users: [],
      step: board[0].step as BoardStep,
      groups: [],
      readyUsers: board[0].readyUsers || [],
    };
    return res;
  }
  async getFullBoard(boardId: BoardId): Promise<Board> {
    const board = await this.db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId));
    const boardUsers = await this.db
      .select()
      .from(users)
      .where(eq(users.id, members.userId))
      .leftJoin(members, eq(members.boardId, boardId));
    const boardCards = await this.db
      .select()
      .from(cards)
      .where(eq(cards.boardId, boardId));
    const boardVotes = await this.db
      .select()
      .from(votes)
      .where(
        inArray(
          votes.cardId,
          boardCards.map((c) => c.id),
        ),
      );
    const boardGroups = await this.db
      .select()
      .from(groups)
      .where(eq(groups.boardId, boardId));
    const res: Board = {
      id: board[0].id,
      createdAt: board[0].createdAt,
      cards: this.getCardsWithVoteCount(boardCards, boardVotes),
      users: boardUsers.map((u) => u.users as User),
      step: board[0].step as BoardStep,
      groups: boardGroups.map((g) => g as Group),
      readyUsers: board[0].readyUsers || [],
    };
    return res;
  }

  private getCardsWithVoteCount(
    boardCards: {
      id: string;
      createdAt: Date;
      userId: string;
      boardId: string;
      text: string | null;
      column: number | null;
      groupId: GroupId | null;
    }[],
    boardVotes: { userId: string; votes: number; cardId: string }[],
  ) {
    return boardCards.map((c) => {
      const votes: Record<UserId, number> = {};
      boardVotes
        .filter((v) => v.cardId === c.id)
        .forEach((v) => {
          if (!votes[v.userId]) votes[v.userId] = 0;
          return (votes[v.userId] += v.votes);
        });

      const card: Card = {
        ...c,
        text: c.text || "",
        column: c.column || 0,
        votes: votes,
        groupId: c.groupId,
      };
      return card;
    });
  }

  async createBoard(): Promise<BoardId> {
    const newBoardId = uuidv4();
    await this.db
      .insert(boards)
      .values({ id: newBoardId, createdAt: new Date() });
    return newBoardId;
  }

  async joinBoard(boardId: string, userId: string): Promise<void> {
    const res = await this.db
      .select()
      .from(members)
      .where(and(eq(members.boardId, boardId), eq(members.userId, userId)));
    if (res.length > 0) {
      return;
    }
    await this.db.insert(members).values({ boardId, userId });
  }
}
