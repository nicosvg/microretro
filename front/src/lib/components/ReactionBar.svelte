<script lang="ts">
	import type { CardId } from '@domain/card';
	import type { BoardId } from '@domain/board';
	import type { ReactionDTO, Emoji, AllowedEmoji } from '@domain/reaction';
	import { ALLOWED_EMOJIS } from '@domain/reaction';
	import { addReaction, removeReaction } from '$lib/services/reactions';
	import { Plus } from 'lucide-svelte';

	interface Props {
		cardId: CardId;
		boardId: BoardId;
		reactions: ReactionDTO[];
		readonly: boolean;
		isHovered?: boolean;
		onPickerOpen?: (x: number, y: number) => void;
	}

	let { cardId, boardId, reactions, readonly, isHovered = false, onPickerOpen }: Props = $props();

	// Sort reactions by ALLOWED_EMOJIS order
	const sortedReactions = $derived(
		[...reactions].sort((a, b) => {
			const indexA = ALLOWED_EMOJIS.indexOf(a.emoji as AllowedEmoji);
			const indexB = ALLOWED_EMOJIS.indexOf(b.emoji as AllowedEmoji);
			return indexA - indexB;
		})
	);

	async function handleReactionClick(emoji: Emoji) {
		if (readonly) return;

		try {
			const existingReaction = reactions.find((r) => r.emoji === emoji);

			if (existingReaction && existingReaction.hasReacted) {
				// User already reacted with this emoji, remove it
				await removeReaction(boardId, cardId, emoji);
			} else {
				// Add or switch to this reaction
				await addReaction(boardId, cardId, emoji);
			}
		} catch (error) {
			console.error('Failed to handle reaction:', error);
		}
	}

	function handleAddClick(event: MouseEvent) {
		if (!readonly && onPickerOpen) {
			const button = event.currentTarget as HTMLButtonElement;
			const rect = button.getBoundingClientRect();
			onPickerOpen(rect.left, rect.bottom + 4);
		}
	}

	export function handleAddReaction(emoji: AllowedEmoji) {
		return addReaction(boardId, cardId, emoji);
	}
</script>

<div class="reaction-bar" aria-label="Reactions">
	{#each sortedReactions as reaction (reaction.emoji)}
		<button
			disabled={readonly}
			onclick={() => handleReactionClick(reaction.emoji)}
			aria-label="{reaction.hasReacted ? 'Remove your' : 'Add'} {reaction.emoji} reaction"
			type="button"
			class={`chip  ${reaction.hasReacted ? 'preset-filled-primary-100-900' : 'preset-tonal-surface'}`}
		>
			<span class="emoji">{reaction.emoji}</span>
			<span class="count">{reaction.count}</span>
		</button>
	{/each}

	{#if !readonly}
		<button
			onclick={handleAddClick}
			aria-label="Add reaction"
			disabled={readonly}
			title="Add reaction"
			class="add-reaction-btn {isHovered ? 'visible' : ''}"
		>
			<Plus size={16} />
		</button>
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

	.add-reaction-btn {
		opacity: 0;
		transition: opacity 0.2s;
	}

	.add-reaction-btn.visible {
		opacity: 1;
	}

	.emoji {
		font-size: 1rem;
		line-height: 1;
		margin-right: 0.25rem;
	}

	.count {
		font-size: 0.75rem;
		font-weight: 500;
		min-width: 1ch;
	}
</style>
