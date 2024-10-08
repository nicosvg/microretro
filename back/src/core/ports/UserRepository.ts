import type { User } from "../domain/user";

export interface UserRepository {
  createUser(user: User): Promise<void>
}
