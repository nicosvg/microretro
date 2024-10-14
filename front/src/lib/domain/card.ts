import type { BoardId } from "./board"
import type { UserId } from "./user"

export type CardId = string

export interface Card {
  id: CardId
  text: string
  userId: UserId
  boardId: BoardId
  createdAt: Date
  column: number
}
