import type { Group, GroupId } from "@domain/group";

export interface GroupRepository {
  createGroup(group: Group): Promise<GroupId>;
  updateGroup(group: Group): Promise<void>;
  getGroup(groupId: GroupId): Promise<Group>;
  deleteGroup(groupId: GroupId): Promise<void>;
}
