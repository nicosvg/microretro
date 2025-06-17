import { getNextState } from "@domain/board";
import type { BoardRepository } from "../ports/BoardRepository";

export function goToNextState(boardRepo: BoardRepository) {
  return async (boardId: string) => {
    const board = await boardRepo.getBoard(boardId);
    const nextStep = getNextState(board.step);
    await boardRepo.updateBoard({ ...board, step: nextStep, readyUsers: [] });
    return nextStep;
  };
}
