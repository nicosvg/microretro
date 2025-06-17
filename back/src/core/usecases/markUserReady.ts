import type { BoardId } from "@domain/board";
import type { UserId } from "@domain/user";
import type { BoardRepository } from "../ports/BoardRepository";

export function markUserReady(boardRepo: BoardRepository) {
    return async (boardId: BoardId, userId: UserId, isReady: boolean): Promise<void> => {
        const board = await boardRepo.getBoard(boardId);
        const readyUsers = isReady
            ? [...board.readyUsers, userId]
            : board.readyUsers.filter(id => id !== userId);

        await boardRepo.updateBoard({ ...board, readyUsers });
    };
} 