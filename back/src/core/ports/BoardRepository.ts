import type { Board, BoardId } from "@domain/board";
import type { UserId } from "@domain/user";

export interface BoardRepository {
  getBoard(boardId: BoardId, currentUserId: UserId): Promise<Board>;
  createBoard(): Promise<BoardId>;
  joinBoard(boardId: BoardId, userId: UserId): Promise<void>;
  updateBoard(board: Board): Promise<void>;
}
