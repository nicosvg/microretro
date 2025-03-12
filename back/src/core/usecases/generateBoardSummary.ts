import type { BoardRepository } from "../ports/BoardRepository";
import { getBoard } from "./getBoard";

export async function generateBoardSummary(
  boardId: string,
  boardRepo: BoardRepository
) {
  const board = await getBoard(boardId, boardRepo);

  const cardsByColumn: Record<string, any[]> = {};
  board.cards.forEach((card) => {
    if (!cardsByColumn[card.column]) {
      cardsByColumn[card.column] = [];
    }
    cardsByColumn[card.column].push(card);
  });

  const prompt = `
    Create a concise summary of this retrospective meeting:
    
    Board: ${board.id}
    
    Cards by column:
    ${Object.entries(cardsByColumn)
      .map(
        ([column, cards]) => `
      Column ${column}:
      ${cards.map((card) => `- ${card.text}`).join("\n")}
    `
      )
      .join("\n")}
    
    Please provide:
    1. A brief overview of the main themes
    2. Key achievements highlighted
    3. Main challenges identified
    4. Suggested action items
    
    Format the response in markdown.
  `;

  return prompt;
}
