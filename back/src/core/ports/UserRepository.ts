import type { User } from "@domain/user";

export interface UserRepository {
  getUser(userId: string): Promise<User>;
  createUser(user: User): Promise<void>;
}
