import type { BoardId } from "../domain/board";
import type { UserId } from "../domain/user";
import type { BoardRepository } from "../ports/BoardRepository";
import { joinBoard } from "./joinBoard";

export function createBoard(boardRepo: BoardRepository) {
  return async (connectedUserId: UserId): Promise<BoardId> => {
    const boardId = await boardRepo.createBoard()
    await joinBoard(boardRepo)(boardId, connectedUserId)
    return boardId
  }
}
