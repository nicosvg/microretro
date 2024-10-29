import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { users } from "./schema";
import type { UserRepository } from "../../core/ports/UserRepository";
import { eq } from "drizzle-orm";
import type { User } from "@domain/user";

export class DrizzleUserRepo implements UserRepository {
  constructor(private db: NodePgDatabase) {}
  async createUser(user: User): Promise<void> {
    await this.db.insert(users).values(user);
    return;
  }
  async getUser(userId: string): Promise<User> {
    const res = await this.db.select().from(users).where(eq(users.id, userId));
    return res[0] as User;
  }
}
