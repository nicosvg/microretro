import { Router } from "express";
import type { Request, Response } from "express";
import type { GroupRepository } from "../core/ports/GroupRepository";
import type { CardRepository } from "../core/ports/CardRepository";
import { createGroup } from "../core/usecases/createGroup";
import { addCardToGroup } from "../core/usecases/addCardToGroup";
import { removeCardFromGroup } from "../core/usecases/removeCardFromGroup";

export function groupController(
  groupRepo: GroupRepository,
  cardRepo: CardRepository
) {
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    try {
      const { title, boardId, column } = req.body;
      const groupId = await createGroup(groupRepo)(title, boardId, column);
      res.status(201).json({ groupId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post("/:groupId/cards", async (req: Request, res: Response) => {
    try {
      const { groupId } = req.params;
      const { cardId } = req.body;
      await addCardToGroup(cardRepo, groupRepo)(cardId, groupId);
      res.status(200).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete("/:groupId/cards/:cardId", async (req: Request, res: Response) => {
    try {
      const { groupId, cardId } = req.params;
      await removeCardFromGroup(cardRepo, groupRepo)(cardId, groupId);
      res.status(200).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
