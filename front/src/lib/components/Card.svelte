<script lang="ts">
	import { createGroup } from '$lib/services/createGroup';
	import { deleteCard } from '$lib/services/deleteCard';
	import { removeFromGroup } from '$lib/services/removeFromGroup';
	import { updateCard } from '$lib/services/updateCard';
	import { vote } from '$lib/services/vote';
	import { BoardStep, shouldHideCards, type BoardId } from '@domain/board';
	import { getTotalVotes, type Card } from '@domain/card';
	import type { UserId } from '@domain/user';
	import type { ReactionDTO } from '@domain/reaction';
	import { draggable, droppable, type DragDropState } from '@thisux/sveltednd';
	import { MoreVertical, Pencil, Trash, Vote } from 'lucide-svelte';
	import { scale } from 'svelte/transition';
	import ContextMenu from './ContextMenu.svelte';
	import ReactionBar from './ReactionBar.svelte';

	interface Props {
		boardStep: BoardStep;
		canEdit: boolean;
		canVote?: boolean;
		card: Card;
		connectedUserId: UserId;
		highlighted: boolean;
		userName: string;
		boardId: BoardId;
		reactions: ReactionDTO[];
	}

	let {
		card = $bindable(),
		userName,
		boardStep,
		highlighted,
		canEdit,
		canVote = true,
		connectedUserId,
		boardId,
		reactions
	}: Props = $props();
	let editing = $state(false);
	let editedText = $state(card.text);
	let status: 'IDLE' | 'VOTING' = $state('IDLE');
	let isHovered = $state(false);
	let showContextMenu = $state(false);
	let menuButtonRef: HTMLElement | null = null;

	// Calculate context menu position relative to button
	const menuPosition = $derived(() => {
		if (!menuButtonRef) return { x: 0, y: 0 };
		const rect = menuButtonRef.getBoundingClientRect();
		return {
			x: rect.right + 5, // 5px to the right of button
			y: rect.top
		};
	});

	function toggleContextMenu(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		menuButtonRef = event.currentTarget as HTMLElement;
		showContextMenu = !showContextMenu;
	}

	async function handleRemoveFromGroup() {
		if (card.groupId) {
			try {
				await removeFromGroup(boardId, card.groupId, card.id);
				showContextMenu = false;
			} catch (error) {
				console.error('Failed to remove card from group:', error);
				showContextMenu = false;
				alert(`Failed to remove card from group: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		}
	}

	async function onVoteClick(value: number) {
		console.log('onVoteClick', value);
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
			return 'preset-tonal-warning';
		}
		return getConnectedUserVotes() === 0 ? 'preset-tonal-surface' : 'preset-filled-primary-500';
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

	function getCardClass() {
		const primaryClass = 'preset-filled-surface-500';
		const secondaryClass = 'preset-filled-surface-100-900 ';
		if (boardStep === BoardStep.WRITE) {
			if (card.userId === connectedUserId) {
				return primaryClass;
			}
			return secondaryClass;
		}
		if (boardStep === BoardStep.PRESENT) {
			if (highlighted) {
				return primaryClass + ' shadow-[0_0_10px] shadow-white/30';
			}
			return secondaryClass;
		}
		return secondaryClass;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	use:draggable={{
		container: 'list',
		dragData: card,
		disabled: boardStep !== BoardStep.PRESENT,
		interactive: ['.card-interactive', 'button', 'textarea']
	}}
	use:droppable={{
		container: card.id,
		callbacks: {
			onDrop: handleDrop
		}
		// disabled: card.groupId !== null
	}}
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
	class="card card-hover mb-2 w-full border border-2 border-transparent p-2 px-4 backdrop-blur-md transition-all duration-500 ease-out
	{getCardClass()}
  {boardStep === BoardStep.PRESENT ? 'cursor-move' : 'cursor-pointer'}
  "
>
	<div class="flex justify-end text-sm">
		<!-- Edit and delete buttons -->
		{#if boardStep === BoardStep.WRITE && canEdit}
			<div class="card-interactive transition-opacity duration-200 {isHovered ? 'opacity-100' : 'opacity-0'}">
				<button onclick={() => (editing = true)}>
					<Pencil size={16} />
				</button>
				<button onclick={() => onDeleteCard(card.id)}>
					<Trash size={16} />
				</button>
			</div>
		{/if}
		<!-- Menu button for grouped cards in PRESENT step -->
		{#if boardStep === BoardStep.PRESENT && card.groupId !== null}
			<div class="card-interactive transition-opacity duration-200 {isHovered ? 'opacity-100' : 'opacity-0'}">
				<button onclick={toggleContextMenu}>
					<MoreVertical size={16} />
				</button>
			</div>
		{/if}
		<!-- Votes count -->
		{#if boardStep === BoardStep.DISCUSS && getTotalVotes(card) > 0}
			<div class="row preset-filled-primary-500 badge mb-1">
				{getTotalVotes(card)}
				<Vote size={20} />
			</div>
		{/if}
		<!-- Vote buttons -->
		{#if boardStep === BoardStep.VOTE && canVote}
			<div class="row mb-1 flex justify-center">
				<div
					class="rounded-full {getVoteButtonsClass()} btn-icon-group transition-all duration-200"
				>
					<button
						type="button"
						class="btn-icon rounded-full"
						onclick={() => onVoteClick(-1)}
						disabled={!getConnectedUserVotes() || status === 'VOTING'}>-</button
					>
					{#key getConnectedUserVotes()}
						<button in:scale>{getConnectedUserVotes()}</button>
					{/key}

					<button
						type="button"
						class="btn-icon rounded-full"
						disabled={status === 'VOTING'}
						onclick={() => onVoteClick(1)}>+</button
					>
				</div>
			</div>
		{/if}
	</div>
	<div class="text-pretty text-left">
		{#if card.userId !== connectedUserId && shouldHideCards(boardStep)}
			...
		{:else if editing}
			<textarea
				bind:value={editedText}
				class="textarea preset-tonal-secondary border-secondary-500 my-2 border p-4"
				rows="4"
			></textarea>
			<button
				class="preset-tonal-secondary border-secondary-500 btn btn-md border"
				onclick={() => {
					editing = false;
					editedText = card.text;
				}}>Cancel</button
			>
			<button
				class="preset-tonal-primary border-primary-500 btn btn-md border"
				onclick={() => {
					// Maybe remove this when backend is finished
					card.text = editedText;
					editCard(card);
					editing = false;
				}}>Save</button
			>
		{:else}
			<p>{card.text}</p>
		{/if}
	</div>

	<!-- Reaction Bar -->
	<ReactionBar
		cardId={card.id}
		{boardId}
		{reactions}
		readonly={boardStep !== BoardStep.PRESENT && boardStep !== BoardStep.DISCUSS}
	/>

	<div class="text-end text-xs italic">– {userName}</div>
</div>

{#if showContextMenu && menuPosition()}
	<ContextMenu
		x={menuPosition().x}
		y={menuPosition().y}
		items={[
			{
				label: 'Remove from group',
				onClick: handleRemoveFromGroup
			}
		]}
		onClose={() => (showContextMenu = false)}
	/>
{/if}

<style>
	.drag-over {
		border: 2px white solid;
	}
</style>
