import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { BoardRepository } from "../../core/ports/BoardRepository";
import { boards, cards, groups, members, users, votes, reactions } from "./schema";
import { v4 as uuidv4 } from "uuid";
import { eq, and, inArray, lt, desc } from "drizzle-orm";
import { BoardStep, DEFAULT_COLUMN_NAMES, type Board, type BoardId } from "@domain/board";
import type { Card } from "@domain/card";
import type { User, UserId } from "@domain/user";
import type { Group, GroupId } from "@domain/group";

export class DrizzleBoardRepo implements BoardRepository {
  constructor(private db: NodePgDatabase) { }
  async updateBoard(board: Board): Promise<void> {
    await this.db.update(boards).set(board).where(eq(boards.id, board.id));
  }

  async getBoard(boardId: BoardId): Promise<Board> {
    const board = await this.db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId));
    const res: Board = {
      id: board[0].id,
      createdAt: board[0].createdAt,
      cards: [],
      users: [],
      step: board[0].step as BoardStep,
      groups: [],
      readyUsers: board[0].readyUsers || [],
      columnNames: board[0].columnNames || DEFAULT_COLUMN_NAMES,
    };
    return res;
  }
  async getFullBoard(boardId: BoardId): Promise<Board> {
    const board = await this.db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId));
    const boardUsers = await this.db
      .select()
      .from(users)
      .where(eq(users.id, members.userId))
      .leftJoin(members, eq(members.boardId, boardId));
    const boardCards = await this.db
      .select()
      .from(cards)
      .where(eq(cards.boardId, boardId));
    const boardVotes = await this.db
      .select()
      .from(votes)
      .where(
        inArray(
          votes.cardId,
          boardCards.map((c) => c.id),
        ),
      );
    const boardGroups = await this.db
      .select()
      .from(groups)
      .where(eq(groups.boardId, boardId));
    const res: Board = {
      id: board[0].id,
      createdAt: board[0].createdAt,
      cards: this.getCardsWithVoteCount(boardCards, boardVotes),
      users: boardUsers.map((u) => u.users as User),
      step: board[0].step as BoardStep,
      groups: boardGroups.map((g) => g as Group),
      readyUsers: board[0].readyUsers || [],
      columnNames: board[0].columnNames || DEFAULT_COLUMN_NAMES,
    };
    return res;
  }

  private getCardsWithVoteCount(
    boardCards: {
      id: string;
      createdAt: Date;
      userId: string;
      boardId: string;
      text: string | null;
      column: number | null;
      groupId: GroupId | null;
    }[],
    boardVotes: { userId: string; votes: number; cardId: string }[],
  ) {
    return boardCards.map((c) => {
      const votes: Record<UserId, number> = {};
      boardVotes
        .filter((v) => v.cardId === c.id)
        .forEach((v) => {
          if (!votes[v.userId]) votes[v.userId] = 0;
          return (votes[v.userId] += v.votes);
        });

      const card: Card = {
        ...c,
        text: c.text || "",
        column: c.column || 0,
        votes: votes,
        groupId: c.groupId,
      };
      return card;
    });
  }

  async createBoard(columnNames?: string[]): Promise<BoardId> {
    const newBoardId = uuidv4();
    await this.db
      .insert(boards)
      .values({
        id: newBoardId,
        createdAt: new Date(),
        columnNames: columnNames || DEFAULT_COLUMN_NAMES
      });
    return newBoardId;
  }

  async joinBoard(boardId: string, userId: string): Promise<void> {
    const res = await this.db
      .select()
      .from(members)
      .where(and(eq(members.boardId, boardId), eq(members.userId, userId)));
    if (res.length > 0) {
      return;
    }
    await this.db.insert(members).values({ boardId, userId });
  }

  async deleteBoard(boardId: BoardId): Promise<void> {
    // Database cascade deletes handle all related data:
    // - cards, members, groups (direct board references)
    // - votes, reactions (through cards)
    await this.db.delete(boards).where(eq(boards.id, boardId));
  }

  async getBoardsOlderThan(date: Date): Promise<BoardId[]> {
    const oldBoards = await this.db
      .select({ id: boards.id })
      .from(boards)
      .where(lt(boards.createdAt, date));

    return oldBoards.map(b => b.id);
  }

  async getBoardLastActivityDate(boardId: BoardId): Promise<Date> {
    const board = await this.db
      .select({ createdAt: boards.createdAt })
      .from(boards)
      .where(eq(boards.id, boardId));

    if (board.length === 0) {
      throw new Error(`Board ${boardId} not found`);
    }

    let lastActivity = board[0].createdAt;

    // Check cards - get the most recent one
    const latestCard = await this.db
      .select({ createdAt: cards.createdAt })
      .from(cards)
      .where(eq(cards.boardId, boardId))
      .orderBy(desc(cards.createdAt))
      .limit(1);

    if (latestCard.length > 0 && latestCard[0].createdAt > lastActivity) {
      lastActivity = latestCard[0].createdAt;
    }

    // Check groups - get the most recent one
    const latestGroup = await this.db
      .select({ createdAt: groups.createdAt })
      .from(groups)
      .where(eq(groups.boardId, boardId))
      .orderBy(desc(groups.createdAt))
      .limit(1);

    if (latestGroup.length > 0 && latestGroup[0].createdAt > lastActivity) {
      lastActivity = latestGroup[0].createdAt;
    }

    // Check reactions - get the most recently updated one
    const boardCardIds = await this.db
      .select({ id: cards.id })
      .from(cards)
      .where(eq(cards.boardId, boardId));

    if (boardCardIds.length > 0) {
      const latestReaction = await this.db
        .select({ updatedAt: reactions.updatedAt })
        .from(reactions)
        .where(inArray(reactions.cardId, boardCardIds.map(c => c.id)))
        .orderBy(desc(reactions.updatedAt))
        .limit(1);

      if (latestReaction.length > 0 && latestReaction[0].updatedAt > lastActivity) {
        lastActivity = latestReaction[0].updatedAt;
      }
    }

    return lastActivity;
  }
}
