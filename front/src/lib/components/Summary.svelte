<script lang="ts">
	import { apiFetch } from '$lib/services/api';
	import type { Board } from '@domain/board';

	export let board: Board;
	export let summary: string | null = null;
	export let isLoading: boolean = false;

	async function generateSummary() {
		isLoading = true;
		try {
			const token = localStorage.getItem('token');
			const response = await apiFetch(`/boards/${board.id}/summary`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});
			const data = await response.json();
			if (data.success) {
				summary = data.summary;
			} else {
				console.error('Error from API:', data.error);
				summary = `Failed to generate summary: ${data.error || 'Unknown error'}`;
			}
		} catch (error) {
			console.error('Error generating summary:', error);
			summary = 'Failed to generate summary due to an unexpected error.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex w-full flex-col items-center justify-center gap-4">
	<h2 class="h2 text-tertiary-500">Retrospective Summary</h2>

	{#if !summary && !isLoading}
		<button class="variant-filled-primary btn" on:click={generateSummary}>
			Generate Summary
		</button>
	{/if}

	{#if isLoading}
		<div class="flex flex-col items-center">
			<p>Generating your retrospective summary...</p>
		</div>
	{/if}

	{#if summary}
		<div class="card variant-soft-surface w-full max-w-3xl p-6">
			<div class="whitespace-pre-line">{summary}</div>
		</div>
	{/if}
</div>
