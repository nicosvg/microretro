<script lang="ts">
	import { BoardStep } from '@domain/board';
	import type { Card } from '@domain/card';
	import type { Group } from '@domain/group';
	import type { User } from '@domain/user';
	import { fly } from 'svelte/transition';
	import CardComponent from './Card.svelte';

	export let columnId: number;
	export let title: string;
	export let cards: Card[];
	export let groups: Group[];
	export let boardStep: BoardStep;
	export let sortedUsers: User[];
	export let currentUserIndex: number;
	export let connectedUserId: string;
	export let boardId: string;
	export let onAddCard: (columnId: number) => Promise<void>;

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
		<button class="variant-filled btn mb-4" onclick={() => onAddCard(columnId)}> Add here </button>
	{/if}

	<div class="mt-4">
		<ul class="list mb-4">
			{#each groups as group (group.id)}
				<li class="mb-2">
					<div class="card variant-ghost-secondary p-4 text-center">
						<ul class="mt-2">
							{#each cards.filter((c) => c.groupId === group.id) as card, index (card.id)}
								<li in:fly={{ y: -200, duration: 1000 }} class="mb-1">
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
