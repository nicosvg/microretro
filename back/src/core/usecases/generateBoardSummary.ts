import type { BoardRepository } from "../ports/BoardRepository";

export async function generateBoardSummary(
  boardId: string,
  boardRepo: BoardRepository
): Promise<string> {
  console.log(`Fetching board data for summary: ${boardId}`);

  // Get the board with all its cards
  const board = await boardRepo.getFullBoard(boardId);
  if (!board) {
    throw new Error(`Board not found: ${boardId}`);
  }

  // Get all cards organized by column
  const cards = board.cards || [];

  // Organize cards by column
  const cardsByColumn: Record<string, any[]> = {};
  cards.forEach((card) => {
    const columnKey = `column${card.column}`;
    if (!cardsByColumn[columnKey]) {
      cardsByColumn[columnKey] = [];
    }
    cardsByColumn[columnKey].push(card);
  });

  // Generate the prompt with board information
  let prompt = `Generate a concise summary for a retrospective board titled "${
    board.id || "Retrospective"
  }".`;
  prompt += "\n\nThe board contains the following cards grouped by column:";

  // Add cards from each column
  Object.entries(cardsByColumn).forEach(([columnName, columnCards]) => {
    let columnTitle = "Unknown";

    // Map column numbers to typical retrospective column names
    if (columnName === "column0") columnTitle = "What went well";
    else if (columnName === "column1") columnTitle = "What could be improved";
    else if (columnName === "column2") columnTitle = "Action items";

    prompt += `\n\n${columnTitle}:`;
    if (columnCards.length === 0) {
      prompt += "\n- (No cards in this column)";
    } else {
      columnCards.forEach((card) => {
        prompt += `\n- ${card.text}`;
      });
    }
  });

  // Add instructions for the AI model
  prompt +=
    "\n\nPlease summarize the main points from this retrospective and provide:";
  prompt += "\n1. A brief overview of the positives";
  prompt += "\n2. Key challenges or areas for improvement";
  prompt += "\n3. Suggested action items or next steps";
  prompt += "\n\nKeep the summary concise and actionable.";

  return prompt;
}
