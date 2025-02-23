import type { Board, BoardId } from "@domain/board";
import type { BoardRepository } from "../ports/BoardRepository";

export async function getBoard(
  boardId: BoardId,
  boardRepo: BoardRepository,
): Promise<Board> {
  return await boardRepo.getFullBoard(boardId);
}
