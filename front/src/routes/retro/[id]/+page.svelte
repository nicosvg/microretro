<script lang="ts">
	import { page } from '$app/stores';
	import CardComponent from '$lib/components/Card.svelte';
	import Login from '$lib/components/Login.svelte';
	import { onMount } from 'svelte';
	import { Events, type MessageData } from '@domain/event';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { Card } from '@domain/card';
	import { type Board, BoardStep, shouldHideCards } from '@domain/board';
	import type { User } from '@domain/user';
	import { joinBoard } from '$lib/services/joinBoard';
	import store from '$lib/store';
	import { createCard } from '$lib/services/createCard';
	import { goToNextStep } from '$lib/services/goToNextStep';
	import { invalidateAll } from '$app/navigation';

	export let data: Board;
	let board = data;
	let users = board.users;

	const columns = [
		{ id: 0, title: 'Good' },
		{ id: 1, title: 'Bad' },
		{ id: 2, title: 'Action items' }
	];

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

	let cards = board.cards;

	let cardText = '';
	const boardId = $page.params.id;
	const toastStore = getToastStore();

	onMount(() => {
		store.openBoardWebsocket(boardId);
		store.subscribe((data: MessageData) => {
			if (!data) return;
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

<Login></Login>

<h1 class="h1 pb-4 pt-4 text-secondary-500">Retrospective board</h1>
<div>
	<h3 class="h3 text-secondary-500">Connected users:</h3>
	<ul class="flex gap-1">
		{#each users as user}
			<li class="text-primary-500">{user.name}</li>
		{/each}
	</ul>
</div>

<section class="retro__header" id="steps">
	<h2 class="h3 text-tertiary-500">Current step</h2>
	<h2 class="h3 text-tertiary-500">{board.step}</h2>
	<button class="variant-filled-surface btn mb-4" on:click={() => onNextStepClick()}
		>Next step</button
	>
</section>

{#if board.step === BoardStep.WRITE}
	<div>
		<textarea
			bind:value={cardText}
			class="textarea m-4 text-primary-200"
			rows="4"
			placeholder="Add a card"
		/>
	</div>
{/if}

<div class="columns columns-3-xs gap-8">
	{#each columns as column}
		<div class="column">
			<div class="retro__header mt-4">
				<h2 class="h2 text-tertiary-500">{column.title}</h2>
			</div>

			{#if board.step === BoardStep.WRITE}
				<button class="variant-filled btn mb-4" on:click={() => addCard(column.id)}>
					Add here
				</button>
			{/if}

			<div class="retro__content">
				<ul class="list">
					{#each cards.filter((c) => c?.column === column.id) as item (item.id)}
						<li>
							<CardComponent
								card={item}
								userName={getUserName(item.userId, users)}
								hidden={item.userId !== connectedUser.id && shouldHideCards(board)}
								boardStep={board.step}
							/>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/each}
</div>

<style>
	.columns {
		display: flex;
	}
	.column {
		display: flex;
		flex-direction: column;
	}
</style>
