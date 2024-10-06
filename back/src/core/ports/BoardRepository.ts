import type { BoardId } from "../domain/board";

export interface BoardRepository {
  createBoard(): Promise<BoardId>;
}

