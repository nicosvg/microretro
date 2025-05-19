import type { User, UserId } from "@domain/user";
import type { UserRepository } from "../../ports/UserRepository";

export class InMemoryUserRepository implements UserRepository {
    private users: Map<UserId, User> = new Map();

    async getUser(userId: string): Promise<User> {
        const user = this.users.get(userId);
        if (!user) {
            throw new Error(`User with id ${userId} not found`);
        }
        return { ...user };
    }

    async createUser(user: User): Promise<void> {
        this.users.set(user.id, { ...user });
    }

    // Test helper methods
    reset(): void {
        this.users.clear();
    }

    setUsers(users: User[]): void {
        this.reset();
        users.forEach(user => this.users.set(user.id, { ...user }));
    }

    getAll(): User[] {
        return Array.from(this.users.values()).map(user => ({ ...user }));
    }
}
