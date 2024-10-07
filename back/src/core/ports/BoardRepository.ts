import type { Board, BoardId } from "../domain/board";

export interface BoardRepository {
  getBoard(boardId: string): Promise<Board>;
  createBoard(): Promise<BoardId>;
}

