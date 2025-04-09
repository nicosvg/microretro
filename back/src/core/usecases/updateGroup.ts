import type { GroupRepository } from "../ports/GroupRepository";
import type { Group } from "@domain/group";

export function updateGroup(groupRepo: GroupRepository) {
  return async function (group: Group): Promise<void> {
    await groupRepo.updateGroup(group);
  };
}
