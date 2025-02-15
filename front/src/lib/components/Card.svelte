<script lang="ts">
	import { vote } from '$lib/services/vote';
	import { BoardStep } from '@domain/board';
	import type { Card } from '@domain/card';
	import { scale } from 'svelte/transition';

	interface Props {
		card: Card;
		userName: string;
		hidden: boolean;
		boardStep: BoardStep;
		highlighted: boolean;
	}

	let { card = $bindable(), userName, hidden, boardStep, highlighted }: Props = $props();

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
	<div class="text-sm">
		{userName} says:
	</div>
	<div>
		{#if hidden}
			...
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
