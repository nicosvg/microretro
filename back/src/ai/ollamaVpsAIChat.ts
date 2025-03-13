import type { AiChatPort } from "../core/ports/AiChatPort";

export class OllamaAiChat implements AiChatPort {
  private readonly ollamaUrl =
    "https://ollama.nicosauvage.fr/api/chat/completions";
  private readonly ollamaApiKey = process.env.OLLAMA_API_KEY;

  async getCompletion(prompt: string): Promise<any> {
    const response = await fetch(this.ollamaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.ollamaApiKey}`,
      },
      body: JSON.stringify({
        model: "qwen2.5:0.5b",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get AI chat completion");
    }

    return response.json();
  }
}
