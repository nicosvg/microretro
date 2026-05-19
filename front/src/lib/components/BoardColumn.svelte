<script lang="ts">
	import { BoardStep } from '@domain/board';
	import { getTotalVotes, type Card, type CardId } from '@domain/card';
	import type { Group } from '@domain/group';
	import type { User } from '@domain/user';
	import type { ReactionDTO } from '@domain/reaction';
	import { fly } from 'svelte/transition';
	import CardComponent from './Card.svelte';

	type BoardColumnProps = {
		columnId: number;
		title: string;
		cards: Card[];
		groups: Group[];
		boardStep: BoardStep;
		sortedUsers: User[];
		currentUserIndex: number;
		connectedUserId: string;
		boardId: string;
		reactionsMap: Map<CardId, ReactionDTO[]>;
		onAddCard: (columnId: number) => Promise<void>;
	};

	let {
		columnId,
		title,
		cards,
		groups,
		boardStep,
		sortedUsers,
		currentUserIndex,
		connectedUserId,
		boardId,
		reactionsMap,
		onAddCard
	}: BoardColumnProps = $props();

	function getUserName(userId: string, users: User[]): string {
		const user = users.find((u) => u !== null && userId === u.id);
		if (!user) return 'Unknown';
		return user.name;
	}

	function getGroupVotes(group: Group): number {
		return cards
			.filter((c) => c.groupId === group.id)
			.reduce((sum, c) => sum + getTotalVotes(c), 0);
	}

	type ColumnItem = { type: 'card'; card: Card } | { type: 'group'; group: Group };

	let columnItems = $derived.by((): ColumnItem[] => {
		const ungrouped = cards
			.filter((c) => c.column === columnId && !c.groupId)
			.map((card): ColumnItem => ({ type: 'card', card }));
		const groupItems = groups.map((group): ColumnItem => ({ type: 'group', group }));
		const all = [...ungrouped, ...groupItems];
		if (boardStep === BoardStep.DISCUSS) {
			all.sort((a, b) => {
				const votesA = a.type === 'card' ? getTotalVotes(a.card) : getGroupVotes(a.group);
				const votesB = b.type === 'card' ? getTotalVotes(b.card) : getGroupVotes(b.group);
				return votesB - votesA;
			});
		}
		return all;
	});
</script>

<div class="flex-1 flex-col items-center text-center">
	<div class="mb-4 flex items-center justify-center gap-2">
		<h2 class="h2 text-tertiary-500">{title}</h2>
	</div>

	{#if boardStep === BoardStep.WRITE}
		<button class="preset-filled btn mb-4" onclick={() => onAddCard(columnId)}> Add here </button>
	{/if}

	<div class="mt-4">
		<ul class="list mb-4">
			{#each columnItems as item (item.type === 'card' ? item.card.id : item.group.id)}
				{#if item.type === 'group'}
					<li class="mb-2">
						<div class="card border-secondary-500 w-full border p-4 text-center">
							<ul class="mt-4">
								{#each cards.filter((c) => c.groupId === item.group.id) as card, index (card.id)}
									<li in:fly={{ y: -200, duration: 1000 }} class="mb-2">
										<CardComponent
											{card}
											userName={getUserName(card.userId, sortedUsers)}
											{boardStep}
											highlighted={sortedUsers[currentUserIndex].id === card.userId &&
												boardStep === BoardStep.PRESENT}
											canEdit={connectedUserId === card.userId}
											{connectedUserId}
											{boardId}
											canVote={index === 0}
											reactions={reactionsMap.get(card.id) || []}
										/>
									</li>
								{/each}
							</ul>
						</div>
					</li>
				{:else}
					<li in:fly={{ y: -200, duration: 1000 }}>
						<CardComponent
							card={item.card}
							userName={getUserName(item.card.userId, sortedUsers)}
							{boardStep}
							highlighted={sortedUsers[currentUserIndex].id === item.card.userId &&
								boardStep === BoardStep.PRESENT}
							canEdit={connectedUserId === item.card.userId}
							{connectedUserId}
							{boardId}
							reactions={reactionsMap.get(item.card.id) || []}
						/>
					</li>
				{/if}
			{/each}
		</ul>
	</div>
</div>
