# AI Summary Implementation Plan

## Overview

This document outlines the implementation plan for adding an AI-generated summary to the retrospective flow. This feature will introduce a new step between "discuss" and "done" that provides an AI-generated summary of the retrospective.

## Current Flow vs Updated Flow

**Current Flow:**

1. Write
2. Present
3. Vote
4. Discuss
5. Done

**Updated Flow:**

1. Write
2. Present
3. Vote
4. Discuss
5. **Summary** (new)
6. Done

## Implementation Steps

### 1. Update Domain Model

1. Modify `domain/board.ts` to add a new board step:
   ```typescript
   export enum BoardStep {
     WRITE = "write",
     PRESENT = "present",
     VOTE = "vote",
     DISCUSS = "discuss",
     SUMMARY = "summary", // New step
     DONE = "done",
   }
   ```

### 2. Backend Implementation

1. Create a new endpoint in the backend API to generate summaries:

   ```typescript
   // in back/src/api/routes/board.ts or appropriate file
   app.post("/board/:id/generate-summary", async (req) => {
     const { id } = req.params;
     const board = await getBoardWithDetails(id);

     // Generate AI prompt based on board content
     const prompt = generateSummaryPrompt(board);

     // Call AI service using Ollama integration
     const summary = await generateAISummary(prompt);

     // Store the summary with the board
     await storeSummary(id, summary);

     return { success: true, summary };
   });
   ```

2. Implement the prompt generation function:

   ```typescript
   function generateSummaryPrompt(board) {
     // Extract card data
     const cardsByColumn = groupCardsByColumn(board.cards);

     // Format the prompt
     return `Generate a concise summary of this retrospective:
     
     Board Title: ${board.title}
     
     ${Object.entries(cardsByColumn)
       .map(([column, cards]) => {
         return `${column} points:
 ${cards
   .map((card) => `- ${card.text} (${getVoteCount(card)} votes)`)
   .join("\n")}
 `;
       })
       .join("\n")}
     
     Please summarize the key themes, identify top voted items, and suggest possible action items.`;
   }
   ```

3. Implement the AI summary generation function:

   ```typescript
   // in back/src/services/ai.ts or appropriate file
   async function generateAISummary(prompt) {
     const ollamaUrl =
       process.env.OLLAMA_URL || "https://ollama.nicosauvage.fr/api/chat";
     const ollamaApiKey = process.env.OLLAMA_API_KEY;

     try {
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

       const data = await response.json();
       return data.message?.content || "Could not generate summary";
     } catch (error) {
       console.error("Error generating AI summary:", error);
       return "Error generating summary. Please try again.";
     }
   }
   ```

4. Implement storage for the summary:
   ```typescript
   // Update schema in appropriate database file
   // Add a 'summary' field to the board table/schema
   ```

### 3. Frontend Implementation

1. Update the steps record in `front/src/routes/retro/[id]/+page.svelte`:

   ```typescript
   const steps: Record<BoardStep, { index: number; label: string }> = {
     write: { index: 1, label: "Write" },
     present: { index: 2, label: "Present" },
     vote: { index: 3, label: "Vote" },
     discuss: { index: 4, label: "Discuss" },
     summary: { index: 5, label: "Summary" }, // New step
     done: { index: 6, label: "Done!" }, // Index updated
   };
   ```

2. Create a new component for the Summary step:

   ```svelte
   <!-- Create file: front/src/components/SummaryView.svelte -->
   <script lang="ts">
     export let board;
     export let summary: string | null = null;
     export let isLoading: boolean = false;

     async function generateSummary() {
       isLoading = true;
       try {
         const response = await fetch(`/api/board/${board.id}/generate-summary`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' }
         });
         const data = await response.json();
         summary = data.summary;
       } catch (error) {
         console.error("Error generating summary:", error);
       } finally {
         isLoading = false;
       }
     }
   </script>

   <div class="flex flex-col items-center justify-center gap-4 w-full">
     <h2 class="h2 text-tertiary-500">Retrospective Summary</h2>

     {#if !summary && !isLoading}
       <button class="variant-filled-primary btn" on:click={generateSummary}>
         Generate Summary
       </button>
     {/if}

     {#if isLoading}
       <div class="flex flex-col items-center">
         <p>Generating your retrospective summary...</p>
         <progress class="progress mt-2" />
       </div>
     {/if}

     {#if summary}
       <div class="card p-4 w-full max-w-3xl variant-filled-surface">
         <div class="prose dark:prose-invert">
           {@html marked(summary)}
         </div>
       </div>

       <button class="variant-filled-secondary btn mt-4" on:click={generateSummary}>
         Regenerate Summary
       </button>
     {/if}
   </div>
   ```

3. Update the main retrospective page to include the Summary view:

   ```svelte
   <!-- Modify front/src/routes/retro/[id]/+page.svelte -->
   <script>
     // Import the new component
     import SummaryView from '../../../components/SummaryView.svelte';
     import { marked } from 'marked'; // Need to add this dependency

     // ... existing code ...
   </script>

   <!-- ... existing code ... -->

   {#if board.step === BoardStep.SUMMARY}
     <SummaryView {board} />
   {/if}

   {#if board.step === BoardStep.DONE}
     <!-- Existing done code -->
   {/if}
   ```

### 4. Update Navigation Logic

1. Modify the next step logic in `front/src/routes/retro/[id]/+page.svelte`:

   ```typescript
   async function onNextStepClick(): Promise<void> {
     await goToNextStep(board.id);
     invalidateAll();
   }
   ```

2. Update the backend to handle the new step transition:

   ```typescript
   // in back/src/services/board.ts or appropriate file
   async function goToNextStep(boardId: string): Promise<void> {
     const board = await getBoardById(boardId);

     let nextStep;
     switch (board.step) {
       case BoardStep.WRITE:
         nextStep = BoardStep.PRESENT;
         break;
       case BoardStep.PRESENT:
         nextStep = BoardStep.VOTE;
         break;
       case BoardStep.VOTE:
         nextStep = BoardStep.DISCUSS;
         break;
       case BoardStep.DISCUSS:
         nextStep = BoardStep.SUMMARY; // Changed from DONE to SUMMARY
         break;
       case BoardStep.SUMMARY:
         nextStep = BoardStep.DONE; // New transition
         break;
       default:
         throw new Error(`Invalid board step: ${board.step}`);
     }

     await updateBoardStep(boardId, nextStep);
   }
   ```

### 5. Update UI Step Indicator

1. Update the step indicator in the UI:
   ```svelte
   <!-- Modify front/src/routes/retro/[id]/+page.svelte -->
   <section class="card variant-soft-surface flex items-center justify-between p-4" id="steps">
     <h2 class="h3 text-tertiary-500">Step {steps[board.step].index}/5</h2>
     <!-- Changed from /4 to /5 -->
     <h2 class="h3 text-tertiary-500">{steps[board.step].label}</h2>
     <!-- ... existing buttons ... -->
   </section>
   ```

### 6. Add Summary Export Option

1. Add an option to export the summary:

   ```svelte
   <!-- Add to SummaryView.svelte -->
   <script>
     // ... existing code ...

     function exportSummary() {
       const element = document.createElement('a');
       const file = new Blob([summary], {type: 'text/plain'});
       element.href = URL.createObjectURL(file);
       element.download = `${board.title}-summary.md`;
       document.body.appendChild(element);
       element.click();
       document.body.removeChild(element);
     }
   </script>

   {#if summary}
     <!-- ... existing summary display ... -->

     <div class="flex gap-2 mt-4">
       <button class="variant-filled-secondary btn" on:click={generateSummary}>
         Regenerate Summary
       </button>
       <button class="variant-filled-tertiary btn" on:click={exportSummary}>
         Export Summary
       </button>
     </div>
   {/if}
   ```

### 7. Testing

1. Unit tests:

   - Test the new board step transitions
   - Test the AI summary generation with mock responses
   - Test the summary storage and retrieval

2. End-to-end tests:
   - Test the complete flow including the new Summary step
   - Test the summary generation UI
   - Test export functionality

## Conclusion

This implementation adds a new "Summary" step to the retrospective flow that leverages the Ollama integration to generate an AI summary of the retrospective. The summary provides valuable insights into key themes and action items from the session, which participants can export for future reference.
