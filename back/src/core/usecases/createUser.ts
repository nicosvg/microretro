import { newUser, type User, type UserId } from "../domain/user";
import type { UserRepository } from "../ports/UserRepository";

export function createUser(userRepo: UserRepository) {
  return async function (userData: Omit<User, 'id'>): Promise<UserId> {
    const user = newUser(userData.name);
    await userRepo.createUser(user);
    return user.id;
  };
}
