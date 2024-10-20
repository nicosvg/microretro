import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Board, BoardId } from "../../core/domain/board";
import type { BoardRepository } from "../../core/ports/BoardRepository";
import { boards, cards, members, users } from "./schema";
import { v4 as uuidv4 } from 'uuid'; import { eq } from 'drizzle-orm';

export class DrizzleBoardRepo implements BoardRepository {
  constructor(private db: NodePgDatabase) { }

  async getBoard(boardId: string): Promise<Board> {
    const res = await this.db.select().from(boards).where(eq(boards.id, boardId))
      .leftJoin(cards, eq(boards.id, cards.boardId))
      .leftJoin(members, eq(boards.id, members.boardId))
      .leftJoin(users, eq(users.id, members.userId))
    const board = {
      id: res[0].board.id,
      createdAt: res[0].board.createdAt,
      cards: res.map((row: any) => (row.cards)),
      users: res.map((row: any) => (row.users)),
    }

    return board
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
