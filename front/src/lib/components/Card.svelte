<script lang="ts">
	import { vote } from '$lib/services/vote';
	import { BoardStep } from '@domain/board';
	import type { Card } from '@domain/card';
	import { Pencil, Trash } from 'lucide-svelte';
	import { scale } from 'svelte/transition';

	interface Props {
		card: Card;
		userName: string;
		hidden: boolean;
		boardStep: BoardStep;
		highlighted: boolean;
		onEdit: (card: Card) => void;
		onDelete: () => void;
		canEdit: boolean;
	}

	let {
		card = $bindable(),
		userName,
		hidden,
		boardStep,
		highlighted,
		onEdit,
		onDelete,
		canEdit
	}: Props = $props();
	let editing = $state(false);
	let editedText = $state(card.text);


	async function onVoteClick(value: number) {
		const success = await vote(card.id, value);
		if (success) {
			card.currentUserVotes = (card.currentUserVotes || 0) + value;
		}
	}
</script>

<div
	class="card card-hover w-full p-4 text-primary-200 {highlighted
		? 'variant-filled-primary'
		: 'variant-soft-secondary'}"
>
	<div class="flex justify-between text-sm">
		<div>{userName} says:</div>
		{#if boardStep === BoardStep.WRITE && canEdit}
			<button onclick={() => (editing = true)}>
				<Pencil size={16} />
			</button>
			<button onclick={() => onDelete()}>
				<Trash size={16} />
			</button>
		{/if}
	</div>
	<div>
		{#if hidden}
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
					onEdit(card);
					editing = false;
				}}>Save</button
			>
		{:else}
			{card.text}
		{/if}
	</div>
	{#if boardStep === BoardStep.VOTE}
		<div class="row mt-2 flex">
			<div
				class="{card.currentUserVotes === 0
					? 'variant-ghost-tertiary'
					: 'variant-ghost-primary'} btn-group"
			>
				<button type="button" onclick={() => onVoteClick(-1)} disabled={!card.currentUserVotes}
					>-</button
				>
				{#key card.currentUserVotes}
					<button in:scale>{card.currentUserVotes || 0}</button>
				{/key}

				<button type="button" onclick={() => onVoteClick(1)}>+</button>
			</div>
		</div>
	{/if}
	{#if boardStep === BoardStep.DISCUSS}
		<div
			class="row {card.totalVotes === 0
				? 'variant-filled'
				: 'variant-filled-primary'} badge mt-2 flex"
		>
			Votes: {card.totalVotes}
		</div>
	{/if}
</div>
