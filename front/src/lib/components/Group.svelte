<script lang="ts">
	import { BoardStep, type BoardId } from '@domain/board';
	import type { Card } from '@domain/card';
	import type { Group } from '@domain/group';
	import CardComponent from './Card.svelte';

	let {
		group,
		cards = [],
		boardStep,
		canEdit = false,
		connectedUserId,
		boardId
	} = $props<{
		group: Group;
		cards: Card[];
		boardStep: BoardStep;
		canEdit: boolean;
		connectedUserId: string;
		boardId: BoardId;
	}>();
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
				{boardStep}
				highlighted={false}
				{canEdit}
				{connectedUserId}
				{boardId}
			/>
		{/each}
	</div>
</div>
