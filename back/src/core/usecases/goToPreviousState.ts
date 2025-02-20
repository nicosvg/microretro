import { getPreviousState } from "@domain/board";
import type { BoardRepository } from "../ports/BoardRepository";

export function goToPreviousState(boardRepo: BoardRepository) {
  return async (boardId: string) => {
    const board = await boardRepo.getBoard(boardId);
    const previousStep = getPreviousState(board.step);
    await boardRepo.updateBoard({ ...board, step: previousStep });
    return previousStep;
  };
}
