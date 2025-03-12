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
5. Done **=> Display summary here**

## Implementation Steps

### 1. Backend Implementation

1. Create a new endpoint in the backend API to generate summaries:

   ```typescript
   // in back/src/api/routes/board.ts or appropriate file
   app.post("/board/:id/summary", async (req) => {
     const { id } = req.params;
     const board = await getBoard(id);

     // Call AI service using Ollama integration
     const summary = await generateAISummary(board);

     return { success: true, summary };
   });
   ```

2. Implement the AI summary generation function:

   ```typescript
   // in back/src/services/ai.ts or appropriate file
   async function generateAISummary(board) {
     const ollamaUrl =
       process.env.OLLAMA_URL;
     const ollamaApiKey = process.env.OLLAMA_API_KEY;

     const prompt = ...

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

### 2. Frontend Implementation

1. Update the steps record in `front/src/routes/retro/[id]/+page.svelte`:

   ```typescript
   const steps: Record<BoardStep, { index: number; label: string }> = {
     write: { index: 1, label: "Write" },
     present: { index: 2, label: "Present" },
     vote: { index: 3, label: "Vote" },
     discuss: { index: 4, label: "Discuss" },
     done: { index: 6, label: "Done!" }, // Index updated
   };
   ```

2. Create a new component for the Summary display:

   ```svelte
   <!-- Create file: front/src/components/Summary.svelte -->
   <script lang="ts">
     export let board;
     export let summary: string | null = null;
     export let isLoading: boolean = false;

     async function generateSummary() {
       isLoading = true;
       try {
         const response = await fetch(`/api/board/${board.id}/summary`, {
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
       // Display the summary here
     {/if}
   </div>
   ```

3. Update the main retrospective page to include the Summary view:

   ```svelte
   <!-- Modify front/src/routes/retro/[id]/+page.svelte -->
   <script>
     // Import the new component
     import Summary from '../../../components/Summary.svelte';

     // ... existing code ...
   </script>

   <!-- ... existing code ... -->

   {#if board.step === BoardStep.DONE}
     <!-- Existing done code -->
     <Summary {board} />
   {/if}
   ```

### 3. Update Navigation Logic

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
         nextStep = BoardStep.DONE;
         break;
       default:
         throw new Error(`Invalid board step: ${board.step}`);
     }

     await updateBoardStep(boardId, nextStep);
   }
   ```

### 4. Testing

1. Unit tests:

   - Test the new board step transitions
   - Test the AI summary generation with mock responses
   - Test the summary storage and retrieval

2. End-to-end tests:
   - Test the complete flow including the new Summary step
   - Test the summary generation UI
   - Test export functionality
