import { getNextState } from "../domain/board";
import type { BoardRepository } from "../ports/BoardRepository";

export function goToNextState(boardRepo: BoardRepository) {
  return async (boardId: string) => {
    const board = await boardRepo.getBoard(boardId);
    const nextState = getNextState(board.state);
    await boardRepo.updateBoard({ ...board, state: nextState });
    return nextState;
  };
}
