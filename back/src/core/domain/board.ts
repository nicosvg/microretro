import type { Card } from "./card"
import type { User } from "./user"

export type BoardId = string

export interface Board {
  id: BoardId,
  createdAt: Date,
  cards: Card[]
  users: User[]
}
