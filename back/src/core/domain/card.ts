import type { BoardId } from "./board"
import type { UserId } from "./user"
import { v4 as uuid } from 'uuid'

export type CardId = string

export interface Card {
  id: CardId,
  text: string,
  userId: UserId
  boardId: BoardId
  createdAt: Date
}

export function newCard(text: string, userId: UserId, boardId: BoardId): Card {
  return {
    id: uuid(),
    text,
    userId,
    boardId,
    createdAt: new Date()
  }
}
