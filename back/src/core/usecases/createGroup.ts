import type { GroupRepository } from "../ports/GroupRepository";
import type { Group } from "@domain/group";
import { v4 as uuidv4 } from "uuid";

export function createGroup(groupRepo: GroupRepository) {
  return async function (
    title: string,
    boardId: string,
    column: number
  ): Promise<string> {
    const groupId = uuidv4();
    const group: Group = {
      id: groupId,
      title,
      boardId,
      column,
      cardIds: [],
      createdAt: new Date(),
    };
    await groupRepo.createGroup(group);
    return groupId;
  };
}
