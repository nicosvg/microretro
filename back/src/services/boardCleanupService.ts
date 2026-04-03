import type { BoardRepository } from "../core/ports/BoardRepository";
import { cleanupOldBoards } from "../core/usecases/cleanupOldBoards";

export class BoardCleanupService {
  constructor(private boardRepo: BoardRepository) {}

  async runCleanup(): Promise<void> {
    const startTime = Date.now();
    console.log(`[Cleanup] Starting board cleanup at ${new Date().toISOString()}`);

    try {
      const deletedCount = await cleanupOldBoards(this.boardRepo)();
      const duration = Date.now() - startTime;

      console.log(
        `[Cleanup] Completed successfully. Deleted ${deletedCount} board(s) in ${duration}ms`
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(
        `[Cleanup] Failed after ${duration}ms:`,
        error instanceof Error ? error.message : error
      );
      // Don't throw - we don't want to crash the server
    }
  }
}
