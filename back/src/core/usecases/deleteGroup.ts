import type { GroupRepository } from "../ports/GroupRepository";
import type { GroupId } from "@domain/group";

export function deleteGroup(groupRepo: GroupRepository) {
  return async function (groupId: GroupId): Promise<void> {
    await groupRepo.deleteGroup(groupId);
  };
}
