# Ollama Integration

## Overview

The application integrates with Ollama, an AI service, to provide AI-powered features within the retrospective tool.

## Implementation Details

The Ollama integration is implemented in the backend API through the [`elysiaRouter.ts`](/Users/fabien/Documents/microretro/back/src/api/elysiaRouter.ts) file. The application uses a remote Ollama instance hosted at "ollama.nicosauvage.fr" to access AI capabilities.

### Key Components

1. **API Endpoint**: A dedicated `/ai` POST endpoint is exposed through the Elysia router
2. **Authentication**: The integration uses an API key stored in the `OLLAMA_API_KEY` environment variable
3. **Model Used**: The application specifically uses the "qwen2.5:0.5b" model for AI capabilities
4. **Request Format**: The API accepts prompts in the request body and forwards them to the Ollama service

### Example Usage

```typescript
// Making a request to the Ollama AI service
const response = await fetch(ollamaUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ollamaApiKey}`,
  },
  body: JSON.stringify({
    model: "qwen2.5:0.5b",
    messages: [{ role: "user", content: prompt }],
  }),
});
```
