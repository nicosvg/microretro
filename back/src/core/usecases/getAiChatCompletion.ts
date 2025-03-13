import type { AiChatPort } from "../ports/AiChatPort";

export function getAiChatCompletion(aiChat: AiChatPort) {
  return async (prompt: string) => {
    return aiChat.getCompletion(prompt);
  };
}
