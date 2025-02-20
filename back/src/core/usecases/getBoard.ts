import type { BoardId, Board } from "@domain/board";
import type { BoardRepository } from "../ports/BoardRepository";
import type { UserId } from "@domain/user";

export async function getBoard(
  boardId: BoardId,
  boardRepo: BoardRepository,
  currentUserId: UserId,
): Promise<Board> {
  return await boardRepo.getFullBoard(boardId, currentUserId);
}
