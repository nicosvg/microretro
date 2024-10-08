import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Board, BoardId } from "../../core/domain/board";
import type { BoardRepository } from "../../core/ports/BoardRepository";
import { boards } from "./schema";
import { v4 as uuidv4 } from 'uuid';

export class DrizzleBoardRepo implements BoardRepository {
  constructor(private db: NodePgDatabase) { }

  getBoard(boardId: string): Promise<Board> {
    throw new Error("Method not implemented.");
  }

  async createBoard(): Promise<BoardId> {
    const newBoardId = uuidv4()
    await this.db.insert(boards).values({ id: newBoardId, createdAt: new Date() })
    return newBoardId
  }

}
