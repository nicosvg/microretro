import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { users } from "./schema";
import type { UserRepository } from "../../core/ports/UserRepository";
import type { User } from "../../core/domain/user";

export class DrizzleUserRepo implements UserRepository {
  constructor(private db: NodePgDatabase) { }
  async createUser(user: User): Promise<void> {
    await this.db.insert(users).values(user)
    return
  }
}
