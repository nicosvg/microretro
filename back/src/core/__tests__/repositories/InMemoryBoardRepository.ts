import { BoardStep, type Board, type BoardId } from "@domain/board";
import type { UserId } from "@domain/user";
import type { BoardRepository } from "../../ports/BoardRepository";

export class InMemoryBoardRepository implements BoardRepository {
    private boards: Map<BoardId, Board> = new Map();

    async getBoard(boardId: BoardId): Promise<Board> {
        const board = this.boards.get(boardId);
        if (!board) {
            throw new Error(`Board with id ${boardId} not found`);
        }
        return { ...board };
    }

    async getFullBoard(boardId: BoardId): Promise<Board> {
        return this.getBoard(boardId);
    }

    async createBoard(): Promise<BoardId> {
        const boardId = `board-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        this.boards.set(boardId, {
            id: boardId,
            createdAt: new Date(),
            cards: [],
            users: [],
            step: BoardStep.WRITE,
            groups: []
        });
        return boardId;
    }

    async joinBoard(boardId: BoardId, userId: UserId): Promise<void> {
        const board = await this.getBoard(boardId);

        // Check if user is already in the board
        if (!board.users.some(user => user.id === userId)) {
            // Fetch the user - in real implementation this would look up the user
            // For simplicity in the in-memory mock, we'll just create a stub user
            const stubUser = {
                id: userId,
                name: `User ${userId}`,
                boardIds: [boardId],
                createdAt: new Date()
            };

            board.users.push(stubUser);
            this.boards.set(boardId, board);
        }
    }

    async updateBoard(board: Board): Promise<void> {
        if (!this.boards.has(board.id)) {
            throw new Error(`Board with id ${board.id} not found`);
        }
        this.boards.set(board.id, { ...board });
    }

    // Test helper methods
    reset(): void {
        this.boards.clear();
    }

    setBoards(boards: Board[]): void {
        this.reset();
        boards.forEach(board => this.boards.set(board.id, { ...board }));
    }

    getAll(): Board[] {
        return Array.from(this.boards.values()).map(board => ({ ...board }));
    }
}
