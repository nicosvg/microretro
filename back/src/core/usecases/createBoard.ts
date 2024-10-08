import type { BoardId } from "../domain/board";
import { newUser } from "../domain/user";
import type { BoardRepository } from "../ports/BoardRepository";
import type { UserRepository } from "../ports/UserRepository";

export async function createBoard(boardRepo: BoardRepository, userRepo: UserRepository): Promise<BoardId> {
  const boardId = await boardRepo.createBoard()
  const user = newUser('test', boardId)
  await userRepo.createUser(user)
  return boardId
}
