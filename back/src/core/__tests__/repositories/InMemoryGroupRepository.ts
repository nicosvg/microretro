import type { Group, GroupId } from "@domain/group";
import type { GroupRepository } from "../../ports/GroupRepository";

export class InMemoryGroupRepository implements GroupRepository {
    private groups: Map<GroupId, Group> = new Map();

    async createGroup(group: Group): Promise<void> {
        this.groups.set(group.id, { ...group });
    }

    async updateGroup(group: Group): Promise<void> {
        const existingGroup = this.groups.get(group.id);
        if (!existingGroup) {
            throw new Error(`Group with id ${group.id} not found`);
        }
        this.groups.set(group.id, { ...group });
    }

    async deleteGroup(groupId: GroupId): Promise<void> {
        this.groups.delete(groupId);
    }

    async getGroup(groupId: GroupId): Promise<Group | null> {
        const group = this.groups.get(groupId);
        if (!group) {
            return null;
        }
        return { ...group };
    }

    // Test helper methods
    reset(): void {
        this.groups.clear();
    }

    setGroups(groups: Group[]): void {
        this.reset();
        groups.forEach(group => this.groups.set(group.id, { ...group }));
    }

    getAll(): Group[] {
        return Array.from(this.groups.values()).map(group => ({ ...group }));
    }
}
