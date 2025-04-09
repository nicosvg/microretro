<script lang="ts">
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';
	import { deleteCard } from '$lib/services/deleteCard';
	import { updateCard } from '$lib/services/updateCard';
	import { vote } from '$lib/services/vote';
	import { BoardStep, shouldHideCards, type BoardId } from '@domain/board';
	import { getTotalVotes, type Card } from '@domain/card';
	import type { UserId } from '@domain/user';
	import { Pencil, Trash } from 'lucide-svelte';
	import { scale } from 'svelte/transition';
	import { createGroup } from '$lib/services/createGroup';

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

	async function onVoteClick(value: number) {
		const currentVotes = card.votes[connectedUserId] || 0;
		status = 'VOTING';
		await vote(card.boardId, card.id, currentVotes + value);
		status = 'IDLE';
	}

	function getConnectedUserVotes() {
		return card.votes[connectedUserId] || 0;
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
</script>

<div
	use:draggable={{ container: 'list', dragData: card }}
	use:droppable={{
		container: card.groupId ? '' : card.id,
		callbacks: {
			onDrop: handleDrop
		}
	}}
	class="card card-hover w-full p-4 text-primary-200 {highlighted
		? 'variant-filled-primary'
		: 'variant-soft-secondary'}"
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
		<div class="row mt-2 flex">
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
</div>
