import { getNextState, BoardStep } from "@domain/board";
import type { BoardRepository } from "../ports/BoardRepository";
import type { AiChatPort } from "../ports/AiChatPort";
import { getTotalVotes, type Card } from "@domain/card";

export function goToNextState(
  boardRepo: BoardRepository,
  aiChatPort: AiChatPort,
) {
  return async (boardId: string) => {
    const board = await boardRepo.getBoard(boardId);
    const nextStep = getNextState(board.step);

    // Generate summary when reaching DONE step
    if (nextStep === BoardStep.DONE) {
      const fullBoard = await boardRepo.getFullBoard(boardId);

      // Get top 3 voted cards
      const sortedCards = fullBoard.cards
        .sort((a, b) => getTotalVotes(b) - getTotalVotes(a))
        .slice(0, 3);

      // Get remaining cards
      const remainingCards = fullBoard.cards
        .sort((a, b) => getTotalVotes(b) - getTotalVotes(a))
        .slice(3);

      // Generate AI summary
      const summary = await generateSummary(
        sortedCards,
        remainingCards,
        aiChatPort,
      );

      // Update board with summary
      await boardRepo.updateBoard({
        ...board,
        step: nextStep,
        summary,
      });
    } else {
      await boardRepo.updateBoard({ ...board, step: nextStep });
    }

    return nextStep;
  };
}

async function generateSummary(
  topCards: Card[],
  remainingCards: Card[],
  aiChatPort: AiChatPort,
): Promise<string> {
  // Prepare prompt for AI
  const prompt = `Generate a markdown summary for a retrospective meeting.

Top 3 voted items:
${topCards.map((card, i) => `${i + 1}. ${card.text}`).join("\n")}

Other items:
${remainingCards.map((card) => `- ${card.text}`).join("\n")}

Please provide a concise summary in markdown format, grouping similar items together and highlighting key insights.`;

  try {
    const summary = await aiChatPort.getCompletion(prompt);
    return summary;
  } catch (error) {
    console.error("Failed to generate AI summary:", error);
    // Fallback to simple summary
    return `## Top Items\n${topCards.map((card, i) => `${i + 1}. ${card.text}`).join("\n")}\n\n## Other Items\n${remainingCards.map((card) => `- ${card.text}`).join("\n")}`;
  }
}
