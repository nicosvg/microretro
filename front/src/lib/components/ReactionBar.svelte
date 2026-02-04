<script lang="ts">
	import type { CardId } from '@domain/card';
	import type { BoardId } from '@domain/board';
	import type { ReactionDTO, Emoji, AllowedEmoji } from '@domain/reaction';
	import { addReaction, removeReaction } from '$lib/services/reactions';
	import { Plus } from 'lucide-svelte';
	import ReactionPicker from './ReactionPicker.svelte';

	interface Props {
		cardId: CardId;
		boardId: BoardId;
		reactions: ReactionDTO[];
		readonly: boolean;
	}

	let { cardId, boardId, reactions, readonly }: Props = $props();
	let showPicker = $state(false);
	let isHovered = $state(false);

	async function handleReactionClick(emoji: Emoji) {
		if (readonly) return;

		try {
			const existingReaction = reactions.find((r) => r.emoji === emoji);

			if (existingReaction && existingReaction.hasReacted) {
				// User already reacted with this emoji, remove it
				await removeReaction(boardId, cardId);
			} else {
				// Add or switch to this reaction
				await addReaction(boardId, cardId, emoji);
			}
		} catch (error) {
			console.error('Failed to handle reaction:', error);
		}
	}

	function handleAddClick() {
		if (!readonly) {
			showPicker = true;
		}
	}

	async function handleEmojiSelect(emoji: AllowedEmoji) {
		try {
			await addReaction(boardId, cardId, emoji);
			showPicker = false;
		} catch (error) {
			console.error('Failed to add reaction:', error);
			showPicker = false;
		}
	}
</script>

<div
	class="reaction-bar"
	role="toolbar"
	aria-label="Reactions"
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	{#each reactions as reaction (reaction.emoji)}
		<button
			class="reaction-button {reaction.hasReacted ? 'active' : ''}"
			disabled={readonly}
			onclick={() => handleReactionClick(reaction.emoji)}
			aria-label="{reaction.hasReacted ? 'Remove your' : 'Add'} {reaction.emoji} reaction"
		>
			<span class="emoji">{reaction.emoji}</span>
			<span class="count">{reaction.count}</span>
		</button>
	{/each}

	{#if (isHovered || showPicker) && !readonly}
		<button
			class="add-reaction-button"
			onclick={handleAddClick}
			aria-label="Add reaction"
			disabled={readonly}
		>
			<Plus size={16} />
		</button>
	{/if}

	{#if showPicker}
		<ReactionPicker onSelect={handleEmojiSelect} onClose={() => (showPicker = false)} />
	{/if}
</div>

<style>
	.reaction-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.5rem;
		align-items: center;
	}

	.reaction-button {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--color-surface-300);
		border-radius: 12px;
		background: var(--color-surface-50);
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
	}

	.reaction-button:hover:not(:disabled) {
		background: var(--color-surface-100);
		border-color: var(--color-surface-400);
	}

	.reaction-button.active {
		background: var(--color-primary-100);
		border-color: var(--color-primary-500);
		color: var(--color-primary-700);
	}

	.reaction-button:disabled {
		cursor: default;
		opacity: 0.6;
	}

	.emoji {
		font-size: 1rem;
		line-height: 1;
	}

	.count {
		font-size: 0.75rem;
		font-weight: 500;
		min-width: 1ch;
		text-align: center;
	}

	.add-reaction-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: 1px solid var(--color-surface-300);
		border-radius: 12px;
		background: var(--color-surface-50);
		cursor: pointer;
		transition: all 0.2s;
		color: var(--color-surface-600);
	}

	.add-reaction-button:hover:not(:disabled) {
		background: var(--color-surface-100);
		border-color: var(--color-surface-400);
		color: var(--color-surface-900);
	}

	.add-reaction-button:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}
</style>
