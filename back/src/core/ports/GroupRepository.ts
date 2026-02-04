import type { Group, GroupId } from "@domain/group";

export interface GroupRepository {
  createGroup(group: Group): Promise<void>;
  updateGroup(group: Group): Promise<void>;
  deleteGroup(groupId: GroupId): Promise<void>;
  getGroup(groupId: GroupId): Promise<Group | null>;
}
