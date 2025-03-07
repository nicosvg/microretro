import type { Group, GroupId } from "@domain/group";
import { groups } from "./schema";
import { eq } from "drizzle-orm";
import type { GroupRepository } from "../../core/ports/GroupRepository";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export class DrizzleGroupRepo implements GroupRepository {
  constructor(private db: NodePgDatabase) {}

  async createGroup(group: Group): Promise<GroupId> {
    const res = await this.db.insert(groups).values(group).returning();
    return res[0].id;
  }
  async updateGroup(group: Group): Promise<void> {
    await this.db.update(groups).set(group).where(eq(groups.id, group.id));
  }
  async getGroup(groupId: GroupId): Promise<Group> {
    const res = await this.db.select().from(groups).where(eq(groups.id, groupId));
    return res[0];
  }
  async deleteGroup(groupId: GroupId): Promise<void> {
    await this.db.delete(groups).where(eq(groups.id, groupId));
  }
}
