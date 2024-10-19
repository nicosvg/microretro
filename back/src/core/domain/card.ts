import type { BoardId } from "./board"
import type { UserId } from "./user"
import { v4 as uuid } from 'uuid'

export type CardId = string

export interface Card {
  id: CardId,
  text: string,
  userId: UserId
  boardId: BoardId
  column: number
  createdAt: Date
}

export function newCard(text: string, userId: UserId, boardId: BoardId, column: number): Card {
  return {
    id: uuid(),
    text,
    userId,
    boardId,
    column: column || 0,
    createdAt: new Date()
  }
}
