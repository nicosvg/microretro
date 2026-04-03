import type { BoardRepository } from "../ports/BoardRepository";

export const cleanupOldBoards = (boardRepo: BoardRepository) => async (): Promise<number> => {
  // Calculate cutoff date (7 days ago)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);

  // Get all boards older than cutoff
  const oldBoardIds = await boardRepo.getBoardsOlderThan(cutoffDate);

  let deletedCount = 0;

  // Check each board for recent activity
  for (const boardId of oldBoardIds) {
    try {
      const lastActivity = await boardRepo.getBoardLastActivityDate(boardId);

      // If last activity is also older than cutoff, delete the board
      if (lastActivity < cutoffDate) {
        await boardRepo.deleteBoard(boardId);
        deletedCount++;
        console.log(`Deleted inactive board: ${boardId}`);
      } else {
        console.log(`Keeping board ${boardId} due to recent activity (${lastActivity.toISOString()})`);
      }
    } catch (error) {
      console.error(`Error processing board ${boardId}:`, error);
      // Continue with next board even if one fails
    }
  }

  return deletedCount;
};
