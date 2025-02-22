import type { CardRepository } from "../ports/CardRepository";
import type { CardId } from "@domain/card";

export const deleteCard = (cardRepo: CardRepository) => async (id: CardId) => {
  await cardRepo.deleteCard(id);
};
