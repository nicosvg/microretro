import type { BoardId } from "../domain/board"
import type { UserId } from "../domain/user"
import type { BoardRepository } from "../ports/BoardRepository"

export function joinBoard(boardRepo: BoardRepository) {
  return (boardId: BoardId, userId: UserId): Promise<void> => {
    return boardRepo.joinBoard(boardId, userId)
  }
}
