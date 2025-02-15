<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import CardComponent from '$lib/components/Card.svelte';
	import ConfettiOnClick from '$lib/components/ConfettiOnClick.svelte';
	import { createCard } from '$lib/services/createCard';
	import { getBoard } from '$lib/services/getBoard';
	import { goToNextStep } from '$lib/services/goToNextStep';
	import { joinBoard } from '$lib/services/joinBoard';
	import store from '$lib/store';
	import { getUserFromLocalStorage } from '$lib/userStore';
	import { type Board, BoardStep, shouldHideCards } from '@domain/board';
	import type { Card } from '@domain/card';
	import { Events, type MessageData } from '@domain/event';
	import type { User } from '@domain/user';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import Frown from 'lucide-svelte/icons/frown';
	import Lightbulb from 'lucide-svelte/icons/lightbulb';
	import Smile from 'lucide-svelte/icons/smile';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	interface Props {
		data: Board;
	}

	let { data }: Props = $props();
	let board: Board = $state(data);
	let users = board.users;
	let currentUserIndex = $state(0);
	const columns = [
		{ id: 0, title: 'Good', icon: Smile },
		{ id: 1, title: 'Bad', icon: Frown },
		{ id: 2, title: 'Actions', icon: Lightbulb }
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

	let cards = $derived(board.cards);

	let cardText = $state('');
	const boardId = page.params.id;
	const toastStore = getToastStore();

	onMount(() => {
		getUserFromLocalStorage();
		store.openBoardWebsocket(boardId);
		store.subscribe(async (data: MessageData) => {
			if (!data) return;
			console.log('Message from server:', data, data.event);
			try {
				switch (data.event) {
					case Events.CREATED_CARD: {
						const { card } = data.payload as { card: Card };
						board.cards = [card, ...cards];
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
						if (step === BoardStep.DISCUSS) {
							// Refresh the board to show all cards with scores
							const newBoard = await getBoard(boardId);
							board.cards = newBoard.cards;
						}
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

{#if board.step === BoardStep.DONE}
	<div class="flex flex-col items-center justify-center gap-4">
		<h1 class="h1 text-center text-6xl">Retrospective done!</h1>
		<h3 class="h3">Thanks for participating</h3>
	</div>
{/if}

{#if board.step === BoardStep.PRESENT}
	<div id="confetti">
		<ConfettiOnClick />
	</div>
{/if}

<section id="retrospective-board" aria-label="Retrospective board" class="flex flex-col gap-4">
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

	{#if board.step !== BoardStep.DONE}
		<section class="card variant-soft-surface flex items-center justify-between p-4" id="steps">
			<h2 class="h3 text-tertiary-500">Step {steps[board.step].index}/4</h2>
			<h2 class="h3 text-tertiary-500">{steps[board.step].label}</h2>
			<button class="variant-filled-surface btn" onclick={() => onNextStepClick()}>Next step</button
			>
		</section>
	{/if}

	<!-- TEXT AREA  -->
	{#if board.step === BoardStep.WRITE}
		<section
			id="card-text-area"
			aria-label="Text area for card writing"
			class="flex justify-center"
		>
			<textarea
				bind:value={cardText}
				class="textarea w-96 p-4 text-primary-200"
				rows="4"
				placeholder="Write here..."
			></textarea>
		</section>
	{/if}

	<div class="columns-3-xs flex justify-center gap-8">
		{#each columns as column}
			<div class="flex-col items-center text-center">
				<div class=" mb-4 flex items-center justify-center gap-2">
					<h2 class="h2 text-tertiary-500">{column.title}</h2>
					{#if column.icon}
						{@const IconComponent = column.icon}
						<IconComponent color="#14B8A6" />
					{/if}
				</div>

				{#if board.step === BoardStep.WRITE}
					<button class="variant-filled btn mb-4" onclick={() => addCard(column.id)}>
						Add here
					</button>
				{/if}

				<div class="mt-4">
					<ul class="list">
						{#each cards.filter((c) => c?.column === column.id) as item (item.id)}
							<li in:fly={{ y: -200, duration: 1000 }}>
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
