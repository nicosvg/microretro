import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { GroupRepository } from "../../core/ports/GroupRepository";
import { groups, cards } from "./schema";
import { eq } from "drizzle-orm";
import type { Group, GroupId } from "@domain/group";

export class DrizzleGroupRepo implements GroupRepository {
  constructor(private db: NodePgDatabase) {}

  async createGroup(group: Group): Promise<void> {
    await this.db.insert(groups).values(group);
  }

  async updateGroup(group: Group): Promise<void> {
    await this.db.update(groups).set(group).where(eq(groups.id, group.id));
  }

  async deleteGroup(groupId: GroupId): Promise<void> {
    await this.db.delete(groups).where(eq(groups.id, groupId));
  }

  async getGroup(groupId: GroupId): Promise<Group> {
    const res = await this.db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId));

    // Fetch card IDs that belong to this group
    const groupCards = await this.db
      .select({ id: cards.id })
      .from(cards)
      .where(eq(cards.groupId, groupId));

    const cardIds = groupCards.map(c => c.id);

    return {
      ...res[0],
      cardIds
    } as Group;
  }
}
