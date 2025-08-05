<script lang="ts">
	import { BoardStep } from '@domain/board';
	import type { Card } from '@domain/card';
	import type { Group } from '@domain/group';
	import type { User } from '@domain/user';
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
		onAddCard
	}: BoardColumnProps = $props();

	function getUserName(userId: string, users: User[]): string {
		const user = users.find((u) => u !== null && userId === u.id);
		if (!user) return 'Unknown';
		return user.name;
	}
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
			{#each groups as group (group.id)}
				<li class="mb-2">
					<div class="card border-secondary-500 w-full border p-4 text-center">
						<ul class="mt-4">
							{#each cards.filter((c) => c.groupId === group.id) as card, index (card.id)}
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
									/>
								</li>
							{/each}
						</ul>
					</div>
				</li>
			{/each}

			{#each cards.filter((c) => c.column === columnId && !c.groupId) as item (item.id)}
				<li in:fly={{ y: -200, duration: 1000 }}>
					<CardComponent
						card={item}
						userName={getUserName(item.userId, sortedUsers)}
						{boardStep}
						highlighted={sortedUsers[currentUserIndex].id === item.userId &&
							boardStep === BoardStep.PRESENT}
						canEdit={connectedUserId === item.userId}
						{connectedUserId}
						{boardId}
					/>
				</li>
			{/each}
		</ul>
	</div>
</div>
