import { describe, test, expect, beforeEach } from "bun:test";
import { cleanupOldBoards } from "../../usecases/cleanupOldBoards";
import { InMemoryBoardRepository } from "../repositories/InMemoryBoardRepository";
import { BoardStep, DEFAULT_COLUMN_NAMES } from "@domain/board";

describe("cleanupOldBoards", () => {
  let boardRepo: InMemoryBoardRepository;

  beforeEach(() => {
    boardRepo = new InMemoryBoardRepository();
  });

  test("should delete boards older than 7 days with no recent activity", async () => {
    // Create an old board (10 days ago)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);

    boardRepo.setBoards([
      {
        id: "old-board",
        createdAt: oldDate,
        cards: [],
        users: [],
        step: BoardStep.DONE,
        groups: [],
        readyUsers: [],
        columnNames: DEFAULT_COLUMN_NAMES,
      },
    ]);

    const deletedCount = await cleanupOldBoards(boardRepo)();

    expect(deletedCount).toBe(1);
    expect(boardRepo.getAll().length).toBe(0);
  });

  test("should keep boards older than 7 days with recent activity", async () => {
    // Create an old board (10 days ago) but with a recent card (5 days ago)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);

    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 5);

    boardRepo.setBoards([
      {
        id: "old-board-with-activity",
        createdAt: oldDate,
        cards: [
          {
            id: "recent-card",
            text: "Recent card",
            boardId: "old-board-with-activity",
            userId: "user-1",
            column: 0,
            votes: {},
            groupId: null,
            createdAt: recentDate,
          },
        ],
        users: [],
        step: BoardStep.DONE,
        groups: [],
        readyUsers: [],
        columnNames: DEFAULT_COLUMN_NAMES,
      },
    ]);

    const deletedCount = await cleanupOldBoards(boardRepo)();

    expect(deletedCount).toBe(0);
    expect(boardRepo.getAll().length).toBe(1);
  });

  test("should keep boards newer than 7 days", async () => {
    // Create a recent board (3 days ago)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 3);

    boardRepo.setBoards([
      {
        id: "recent-board",
        createdAt: recentDate,
        cards: [],
        users: [],
        step: BoardStep.WRITE,
        groups: [],
        readyUsers: [],
        columnNames: DEFAULT_COLUMN_NAMES,
      },
    ]);

    const deletedCount = await cleanupOldBoards(boardRepo)();

    expect(deletedCount).toBe(0);
    expect(boardRepo.getAll().length).toBe(1);
  });

  test("should handle multiple boards correctly", async () => {
    const veryOldDate = new Date();
    veryOldDate.setDate(veryOldDate.getDate() - 30);

    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);

    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 3);

    boardRepo.setBoards([
      {
        id: "very-old-board",
        createdAt: veryOldDate,
        cards: [],
        users: [],
        step: BoardStep.DONE,
        groups: [],
        readyUsers: [],
        columnNames: DEFAULT_COLUMN_NAMES,
      },
      {
        id: "old-board",
        createdAt: oldDate,
        cards: [],
        users: [],
        step: BoardStep.DONE,
        groups: [],
        readyUsers: [],
        columnNames: DEFAULT_COLUMN_NAMES,
      },
      {
        id: "recent-board",
        createdAt: recentDate,
        cards: [],
        users: [],
        step: BoardStep.WRITE,
        groups: [],
        readyUsers: [],
        columnNames: DEFAULT_COLUMN_NAMES,
      },
    ]);

    const deletedCount = await cleanupOldBoards(boardRepo)();

    expect(deletedCount).toBe(2); // very-old-board and old-board
    expect(boardRepo.getAll().length).toBe(1);
    expect(boardRepo.getAll()[0].id).toBe("recent-board");
  });
});
