import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { BoardId } from "../../core/domain/board";
import type { BoardRepository } from "../../core/ports/BoardRepository";
import { Board } from "./schema";
import { v4 as uuidv4 } from 'uuid';

export class DrizzleBoardRepo implements BoardRepository {
  constructor(private db: NodePgDatabase) { }

  async createBoard(): Promise<BoardId> {
    const newBoardId = uuidv4()
    await this.db.insert(Board).values({ id: newBoardId, createdAt: new Date() })
    return newBoardId
  }

}
