import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Board, BoardId } from "../../core/domain/board";
import type { BoardRepository } from "../../core/ports/BoardRepository";
import { boards, cards, members, users } from "./schema";
import { v4 as uuidv4 } from 'uuid'; import { eq } from 'drizzle-orm';
import type { Card } from "../../core/domain/card";
import type { User } from "../../core/domain/user";

export class DrizzleBoardRepo implements BoardRepository {
  constructor(private db: NodePgDatabase) { }

  async getBoard(boardId: string): Promise<Board> {
    const board = await this.db.select().from(boards).where(eq(boards.id, boardId))
    const boardCards = await this.db.select().from(cards).where(eq(cards.boardId, boardId))
    const boardUsers = await this.db.select().from(users).where(eq(users.id, members.userId))
      .leftJoin(members, eq(members.boardId, boardId))
    const res: Board = {
      id: board[0].id,
      createdAt: board[0].createdAt,
      cards: boardCards as Card[],
      users: boardUsers.map(u => u.users as User)
    }
    return res
  }

  async createBoard(): Promise<BoardId> {
    const newBoardId = uuidv4()
    await this.db.insert(boards).values({ id: newBoardId, createdAt: new Date() })
    return newBoardId
  }

  async joinBoard(boardId: string, userId: string): Promise<void> {
    await this.db.insert(members).values({ boardId, userId })
  }
}
