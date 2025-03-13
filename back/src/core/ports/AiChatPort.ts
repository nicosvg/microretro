export interface AiChatPort {
  getCompletion(prompt: string): Promise<string>;
}
