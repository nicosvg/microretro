<script lang="ts">
	import { BoardStep } from '@domain/board';
	import type { Card } from '@domain/card';
	import type { Group } from '@domain/group';
	import CardComponent from './Card.svelte';

	export let group: Group;
	export let cards: Card[] = [];
	export let boardStep: BoardStep;
	export let canEdit: boolean = false;
	export let connectedUserId: string;
</script>

<div class="group">
	<div class="group-header">
		<h3 class="group-title">{group.title || 'Untitled Group'}</h3>
	</div>

	<div class="group-cards">
		{#each cards as card (card.id)}
			<CardComponent
				{card}
				userName={card.userId}
				hidden={false}
				{boardStep}
				highlighted={false}
				{canEdit}
				{connectedUserId}
				onEdit={() => {}}
				onDelete={() => {}}
			/>
		{/each}
	</div>
</div>

<style>
	.group {
		background: var(--color-background-light);
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.group-header {
		margin-bottom: 0.5rem;
	}

	.group-title {
		font-weight: bold;
		font-size: 1.2rem;
	}

	.group-cards {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
