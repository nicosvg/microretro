import type { BoardId } from "../domain/board";
import type { BoardRepository } from "../ports/BoardRepository";

export async function createBoard(boardRepo: BoardRepository): Promise<BoardId> {
  const id = await boardRepo.createBoard()
  return id
}
