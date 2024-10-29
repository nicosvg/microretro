import type { UserId, User } from "@domain/user";
import type { UserRepository } from "../ports/UserRepository";

export function getUser(userRepo: UserRepository) {
  return (userId: UserId): Promise<User> => userRepo.getUser(userId);
}
