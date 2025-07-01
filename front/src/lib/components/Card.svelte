<script lang="ts">
	import { createGroup } from '$lib/services/createGroup';
	import { deleteCard } from '$lib/services/deleteCard';
	import { selectEmoji } from '$lib/services/selectEmoji';
	import { updateCard } from '$lib/services/updateCard';
	import { vote } from '$lib/services/vote';
	import { BoardStep, shouldHideCards, type BoardId } from '@domain/board';
	import { getSortedEmojis, getTotalVotes, type Card } from '@domain/card';
	import type { UserId } from '@domain/user';
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import { Pencil, Trash, Smile } from 'lucide-svelte';
	import { scale } from 'svelte/transition';

	interface Props {
		boardStep: BoardStep;
		canEdit: boolean;
		canVote?: boolean;
		card: Card;
		connectedUserId: UserId;
		highlighted: boolean;
		userName: string;
		boardId: BoardId;
	}

	let {
		card = $bindable(),
		userName,
		boardStep,
		highlighted,
		canEdit,
		canVote = true,
		connectedUserId,
		boardId
	}: Props = $props();
	let editing = $state(false);
	let editedText = $state(card.text);
	let status: 'IDLE' | 'VOTING' = $state('IDLE');
	let emojiStatus: 'IDLE' | 'SELECTING' = $state('IDLE');

	// Predefined emoji list
	const availableEmojis = ['👍', '❤️', '🔥', '😂', '🤔', '🎉'];

	// Popup settings for emoji selector
	const emojiPopupClick: PopupSettings = {
		target: 'emojiPopupClick',
		event: 'click',
		placement: 'bottom'
	};

	async function onVoteClick(value: number) {
		console.log('onVoteClick', value);
		const currentVotes = card.votes[connectedUserId] || 0;
		status = 'VOTING';
		await vote(card.boardId, card.id, currentVotes + value);
		status = 'IDLE';
	}

	async function onEmojiSelect(emoji: string) {
		emojiStatus = 'SELECTING';
		await selectEmoji(card.boardId, card.id, emoji);
		emojiStatus = 'IDLE';
	}

	function getConnectedUserVotes() {
		return card.votes[connectedUserId] || 0;
	}

	function getSelectedEmoji() {
		return card.emojiSelections[connectedUserId] || null;
	}

	function getVoteButtonsClass() {
		if (status == 'VOTING') {
			return 'variant-ghost-warning';
		}
		return getConnectedUserVotes() === 0 ? 'variant-ghost-tertiary' : 'variant-ghost-success';
	}

	async function editCard(card: Card) {
		await updateCard(boardId, card);
	}

	async function onDeleteCard(cardId: string): Promise<void> {
		await deleteCard(boardId, cardId);
	}

	// Handle drops between containers
	async function handleDrop(state: DragDropState<{ id: string }>) {
		const { draggedItem, sourceContainer, targetContainer } = state;
		if (!targetContainer || sourceContainer === targetContainer) return;
		await createGroup(boardId, draggedItem.id, targetContainer);
	}

	// Check if emoji selector should be visible (from PRESENT step onwards)
	function shouldShowEmojiSelector() {
		return (
			boardStep === BoardStep.PRESENT ||
			boardStep === BoardStep.VOTE ||
			boardStep === BoardStep.DISCUSS ||
			boardStep === BoardStep.DONE
		);
	}
</script>

<div
	use:draggable={{
		container: 'list',
		dragData: card,
		disabled: boardStep !== BoardStep.PRESENT,
		interactive: ['.interactive']
	}}
	use:droppable={{
		container: card.id,
		callbacks: {
			onDrop: handleDrop
		}
		// disabled: card.groupId !== null
	}}
	class=" card card-hover text-primary-200 w-full p-4 backdrop-blur-md
  transition-all duration-500 ease-out
   hover:shadow-xl hover:shadow-slate-700
  {highlighted ? 'variant-filled-primary' : 'variant-soft-secondary'}
  {boardStep === BoardStep.PRESENT ? 'cursor-move' : 'cursor-pointer'}
  "
>
	<div class="flex justify-between text-sm">
		<div>{userName} says:</div>
		{#if boardStep === BoardStep.WRITE && canEdit}
			<div>
				<button onclick={() => (editing = true)}>
					<Pencil size={16} />
				</button>
				<button onclick={() => onDeleteCard(card.id)}>
					<Trash size={16} />
				</button>
			</div>
		{/if}
	</div>
	<div>
		{#if card.userId !== connectedUserId && shouldHideCards(boardStep)}
			...
		{:else if editing}
			<textarea bind:value={editedText} class="textarea variant-ghost-secondary my-2 p-4" rows="4"
			></textarea>
			<button
				class="variant-ghost-secondary btn btn-md"
				onclick={() => {
					editing = false;
					editedText = card.text;
				}}>Cancel</button
			>
			<button
				class="variant-ghost-primary btn btn-md"
				onclick={() => {
					// Maybe remove this when backend is finished
					card.text = editedText;
					editCard(card);
					editing = false;
				}}>Save</button
			>
		{:else}
			{card.text}
		{/if}
	</div>
	{#if boardStep === BoardStep.VOTE && canVote}
		<div class="row mt-2 flex justify-center">
			<div class="{getVoteButtonsClass()} btn-group">
				<button
					type="button"
					onclick={() => onVoteClick(-1)}
					disabled={!getConnectedUserVotes() || status === 'VOTING'}>-</button
				>
				{#key getConnectedUserVotes()}
					<button in:scale>{getConnectedUserVotes()}</button>
				{/key}

				<button type="button" disabled={status === 'VOTING'} onclick={() => onVoteClick(1)}
					>+</button
				>
			</div>
		</div>
	{/if}
	{#if boardStep === BoardStep.DISCUSS}
		<div
			class="row {getTotalVotes(card) === 0
				? 'variant-filled'
				: 'variant-filled-primary'} badge mt-2 flex"
		>
			Votes: {getTotalVotes(card)}
		</div>
	{/if}

	{#if shouldShowEmojiSelector()}
		<div class="mt-3 flex items-center justify-between">
			<!-- Emoji Selector Button -->
			<button
				use:popup={emojiPopupClick}
				class="interactive btn btn-sm variant-ghost-tertiary"
				disabled={emojiStatus === 'SELECTING'}
			>
				<Smile size={16} class="mr-1" />
				Add Reaction
			</button>

			<!-- Emoji Display -->
			{#if getSortedEmojis(card).length > 0}
				<div class="flex flex-wrap gap-1">
					{#each getSortedEmojis(card) as { emoji, count }}
						<div class="badge variant-soft-secondary">
							{emoji}
							{count}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<div data-popup="emojiPopupClick" class="card variant-soft-surface p-2">
	<div class="grid grid-cols-3 gap-1">
		{#each availableEmojis as emoji}
			<button
				type="button"
				class="btn btn-sm variant-ghost-tertiary p-2 text-lg"
				onclick={(e) => {
					onEmojiSelect(emoji);
				}}
			>
				{emoji}
			</button>
		{/each}
	</div>
</div>

<style>
	.drag-over {
		border: 2px white solid;
		transform: scale(1.02);
	}
</style>
