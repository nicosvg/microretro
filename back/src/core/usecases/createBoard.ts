import type { UserId } from "@domain/user";
import type { BoardRepository } from "../ports/BoardRepository";
import { joinBoard } from "./joinBoard";
import type { BoardId } from "@domain/board";

export function createBoard(boardRepo: BoardRepository) {
  return async (connectedUserId: UserId, columns: string[]): Promise<BoardId> => {
    const boardId = await boardRepo.createBoard(columns);
    await joinBoard(boardRepo)(boardId, connectedUserId);
    return boardId;
  };
}
