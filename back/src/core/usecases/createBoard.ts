import type { BoardId } from "../domain/board";
import type { BoardRepository } from "../ports/BoardRepository";

export function createBoard(boardRepo: BoardRepository) {
  return async (): Promise<BoardId> => {
    const boardId = await boardRepo.createBoard()
    // TODO: user joins board
    return boardId
  }
}
