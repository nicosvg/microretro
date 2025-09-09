import type { UserId } from "@domain/user";
import type { BoardRepository } from "../ports/BoardRepository";
import { joinBoard } from "./joinBoard";
import type { BoardId } from "@domain/board";

export function createBoard(boardRepo: BoardRepository) {
  return async (connectedUserId: UserId, columnNames?: string[]): Promise<BoardId> => {
    const boardId = await boardRepo.createBoard(columnNames);
    await joinBoard(boardRepo)(boardId, connectedUserId);
    return boardId;
  };
}
