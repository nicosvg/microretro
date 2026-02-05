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

	// Debug: log props
	$effect(() => {
		console.log('ReactionBar props:', { cardId, boardId, reactions: reactions.length, readonly });
	});

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

	<!-- Always show + button for now (debugging) -->
	{#if !readonly}
		<button
			class="add-reaction-button"
			onclick={handleAddClick}
			aria-label="Add reaction"
			disabled={readonly}
			title="Add reaction"
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
		align-items: center;
		position: relative;
	}

	.reaction-button {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		background: #f9fafb;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
	}

	.reaction-button:hover:not(:disabled) {
		background: #f3f4f6;
		border-color: #d1d5db;
		transform: scale(1.05);
	}

	.reaction-button.active {
		background: #dbeafe;
		border-color: #3b82f6;
		color: #1e40af;
		font-weight: 600;
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
		border: 1px solid #d1d5db;
		border-radius: 12px;
		background: #ffffff;
		cursor: pointer;
		transition: all 0.2s;
		color: #6b7280;
	}

	.add-reaction-button:hover:not(:disabled) {
		background: #f3f4f6;
		border-color: #9ca3af;
		color: #111827;
		transform: scale(1.1);
	}

	.add-reaction-button:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}
</style>
