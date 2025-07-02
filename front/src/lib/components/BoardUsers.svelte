<script lang="ts">
	import { BoardStep } from '@domain/board';
	import type { Card } from '@domain/card';
	import type { User } from '@domain/user';
	import { Check } from 'lucide-svelte';

	type BoardUsersProps = {
		users: User[];
		currentUserIndex: number;
		boardStep: BoardStep;
		readyUsers: string[];
		cards: Card[];
		onUserClick: (userIndex: number) => void;
	};

	let { users, currentUserIndex, boardStep, readyUsers, cards, onUserClick }: BoardUsersProps =
		$props();
</script>

<div>
	<div class="flex gap-1">
		{#each users as user}
			<button
				type="button"
				disabled={boardStep !== BoardStep.PRESENT}
				onclick={() => onUserClick(users.findIndex((u) => u.id === user.id))}
				class="{users[currentUserIndex].id === user.id && boardStep === BoardStep.PRESENT
					? 'preset-filled-primary-500'
					: 'preset-filled-secondary-500'} btn
					{(boardStep === BoardStep.WRITE || boardStep === BoardStep.VOTE) && readyUsers.includes(user.id)
					? 'preset-filled-success-500'
					: 'preset-filled-secondary-500'}"
			>
				{#if readyUsers.includes(user.id)}
					<Check size={16} class="ml-1" />
				{/if}
				{user.name}
				{#if boardStep === BoardStep.VOTE}
					({cards.reduce((acc, card: Card) => {
						return acc + (card.votes?.[user.id] || 0);
					}, 0)})
				{/if}
			</button>
		{/each}
	</div>
</div>
