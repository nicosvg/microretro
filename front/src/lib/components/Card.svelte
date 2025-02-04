<script lang="ts">
	import { vote } from '$lib/services/vote';
	import { BoardStep } from '@domain/board';
	import type { Card } from '@domain/card';

	interface Props {
		card: Card;
		userName: string;
		hidden: boolean;
		boardStep: BoardStep;
	}

	let {
		card = $bindable(),
		userName,
		hidden,
		boardStep
	}: Props = $props();

	async function onVoteClick(value: number) {
		const success = await vote(card.id, value);
		if (success) {
			card.currentUserVotes = (card.currentUserVotes || 0) + value;
		}
	}
</script>

<div class="card card-hover w-full p-4 text-primary-200">
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
			<div class="variant-ghost-tertiary btn-group">
				<button type="button" onclick={() => onVoteClick(-1)} disabled={!card.currentUserVotes}
					>-</button
				>
				<button>{card.currentUserVotes || 0}</button>
				<button type="button" onclick={() => onVoteClick(1)}>+</button>
			</div>
		</div>
	{/if}
	{#if boardStep === BoardStep.DISCUSS}
		<div class="row mt-2 flex">
			Votes: {card.totalVotes}
		</div>
	{/if}
</div>
