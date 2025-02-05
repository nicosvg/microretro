<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import CardComponent from '$lib/components/Card.svelte';
	import { createCard } from '$lib/services/createCard';
	import { goToNextStep } from '$lib/services/goToNextStep';
	import { joinBoard } from '$lib/services/joinBoard';
	import store from '$lib/store';
	import { getUserFromLocalStorage } from '$lib/userStore';
	import { type Board, BoardStep, shouldHideCards } from '@domain/board';
	import type { Card } from '@domain/card';
	import { Events, type MessageData } from '@domain/event';
	import type { User } from '@domain/user';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	interface Props {
		data: Board;
	}

	let { data }: Props = $props();
	let board: Board = $state(data);
	let users = board.users;
	let currentUserIndex = $state(0);

	const columns = [
		{ id: 0, title: 'Good' },
		{ id: 1, title: 'Bad' },
		{ id: 2, title: 'Action items' }
	];

	const steps: Record<BoardStep, { index: number; label: string }> = {
		write: { index: 1, label: 'Write' },
		present: { index: 2, label: 'Present' },
		vote: { index: 3, label: 'Vote' },
		discuss: { index: 4, label: 'Discuss' },
		done: { index: 5, label: 'Done!' }
	};

	const parseJwt = (token: string | null) => {
		if (token === null) return null;
		try {
			return JSON.parse(atob(token.split('.')[1]));
		} catch (e) {
			console.error(e);
			return null;
		}
	};
	const token = localStorage.getItem('token');
	const connectedUser = parseJwt(token);

	if (users.find((u) => u.id === connectedUser.id) === undefined) {
		joinBoard(board.id);
	}

	let cards = $state(board.cards);

	let cardText = $state('');
	const boardId = $page.params.id;
	const toastStore = getToastStore();

	onMount(() => {
		getUserFromLocalStorage();
		store.openBoardWebsocket(boardId);
		store.subscribe((data: MessageData) => {
			if (!data) return;
			console.log('Message from server:', data, data.event);
			try {
				switch (data.event) {
					case Events.CREATED_CARD: {
						const { card } = data.payload as { card: Card };
						cards = [...cards, card];
						break;
					}
					case Events.CONNECTED: {
						break;
					}
					case Events.JOINED_BOARD: {
						const { user: newUser } = data.payload as { user: User };
						toastStore.trigger({ message: 'A new user joined the board! Welcome ' + newUser.name });
						users.push(newUser);
						break;
					}
					case Events.CHANGED_STEP: {
						const { step } = data.payload as { step: BoardStep };
						board.step = step;
						break;
					}
					default:
						console.error('Unknown message:', data);
				}
			} catch (e) {
				console.log('Message from server:', data, e);
			}
		});
	});

	async function addCard(columnId: number) {
		await createCard(boardId, cardText, columnId);
		cardText = '';
	}

	function getUserName(userId: string, users: User[]): string {
		const user = users.find((u) => u !== null && userId === u.id);
		if (!user) return 'Unknown';
		return user.name;
	}

	async function onNextStepClick(): Promise<void> {
		await goToNextStep(board.id);
		invalidateAll();
	}
</script>

<section id="retrospective-board" aria-label="Retrospective board" class="flex flex-col">
	<div>
		<div class="flex gap-1">
			{#each users as user}
				<button
					type="button"
					disabled={board.step !== BoardStep.PRESENT}
					onclick={() => (currentUserIndex = users.findIndex((u) => u.id === user.id))}
					class="{users[currentUserIndex].id === user.id && board.step === BoardStep.PRESENT
						? 'variant-filled-primary'
						: 'variant-filled-secondary'} btn">{user.name}</button
				>
			{/each}
		</div>
	</div>

	<section class="card variant-soft-surface mt-4 flex items-center justify-between p-4" id="steps">
		<h2 class="h3 text-tertiary-500">{steps[board.step].index} / 4</h2>
		<h2 class="h3 text-tertiary-500">{steps[board.step].label}</h2>
		<button
			class="variant-filled-surface btn"
			disabled={board.step === BoardStep.DISCUSS}
			onclick={() => onNextStepClick()}>Next step</button
		>
	</section>

	{#if board.step === BoardStep.WRITE}
		<div>
			<textarea
				bind:value={cardText}
				class="textarea m-4 text-primary-200"
				rows="4"
				placeholder="Add a card"
			></textarea>
		</div>
	{/if}

	<div class="columns-3-xs flex gap-8">
		{#each columns as column}
			<div class="flex-col">
				<div class="my-4 text-center">
					<h2 class="h2 text-tertiary-500">{column.title}</h2>
				</div>

				{#if board.step === BoardStep.WRITE}
					<button class="variant-filled btn mb-4" onclick={() => addCard(column.id)}>
						Add here
					</button>
				{/if}

				<div class="mt-4">
					<ul class="list">
						{#each cards.filter((c) => c?.column === column.id) as item (item.id)}
							<li>
								<CardComponent
									card={item}
									userName={getUserName(item.userId, users)}
									hidden={item.userId !== connectedUser.id && shouldHideCards(board)}
									boardStep={board.step}
									highlighted={users[currentUserIndex].id === item.userId &&
										board.step === BoardStep.PRESENT}
								/>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		{/each}
	</div>
</section>
