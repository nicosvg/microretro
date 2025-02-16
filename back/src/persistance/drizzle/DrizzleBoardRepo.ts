import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { BoardRepository } from "../../core/ports/BoardRepository";
import { boards, cards, members, users, votes } from "./schema";
import { v4 as uuidv4 } from "uuid";
import { eq, inArray } from "drizzle-orm";
import { BoardStep, type Board, type BoardId } from "@domain/board";
import type { Card } from "@domain/card";
import type { User, UserId } from "@domain/user";

export class DrizzleBoardRepo implements BoardRepository {
  constructor(private db: NodePgDatabase) {}
  async updateBoard(board: Board): Promise<void> {
    await this.db.update(boards).set(board).where(eq(boards.id, board.id));
  }

  async getBoard(boardId: BoardId, currentUserId: UserId): Promise<Board> {
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
    const res: Board = {
      id: board[0].id,
      createdAt: board[0].createdAt,
      cards: this.getCardsWithVoteCount(boardCards, boardVotes, currentUserId),
      users: boardUsers.map((u) => u.users as User),
      step: board[0].step as BoardStep,
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
    }[],
    boardVotes: { userId: string; votes: number; cardId: string }[],
    currentUserId: UserId,
  ) {
    return boardCards.map((c) => {
      const card: Card = {
        ...c,
        text: c.text || "",
        column: c.column || 0,
        currentUserVotes: boardVotes
          .filter((v) => v.userId === currentUserId)
          .filter((v) => v.cardId === c.id)
          .map((v) => {
            return v.votes;
          })
          .reduce((a, b) => a + b, 0),
        totalVotes: boardVotes
          .filter((v) => v.cardId === c.id)
          .map((v) => {
            return v.votes;
          })
          .reduce((a, b) => a + b, 0),
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
    await this.db.insert(members).values({ boardId, userId });
  }
}
