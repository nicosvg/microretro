import { newUser, type User, type UserId } from "@domain/user";
import type { UserRepository } from "../ports/UserRepository";
import { v4 as uuid } from "uuid";

export function createUser(userRepo: UserRepository) {
  return async function (userData: Omit<User, "id">): Promise<UserId> {
    const userId = uuid();
    const user = newUser(userData.name, userId);
    await userRepo.createUser(user);
    return user.id;
  };
}
