import { v4 as uuid } from 'uuid'
import type { BoardId } from './board'

export type UserId = string

export interface User {
  id: UserId,
  name: string,
  boardIds: BoardId[]
  createdAt: Date
}

export function newUser(name: string, boardId: BoardId): User {
  const id = uuid()
  return {
    id,
    name,
    boardIds: [boardId],
    createdAt: new Date()
  }
}
