<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import CardComponent from '$lib/components/Card.svelte';
	import ConfettiOnClick from '$lib/components/ConfettiOnClick.svelte';
	import { createCard } from '$lib/services/createCard';
	import { getBoard } from '$lib/services/getBoard';
	import { goToNextStep } from '$lib/services/goToNextStep';
	import { joinBoard } from '$lib/services/joinBoard';
	import store from '$lib/messageStore';
	import { getUserFromLocalStorage } from '$lib/userStore';
	import { type Board, BoardStep, shouldHideCards } from '@domain/board';
	import type { Card } from '@domain/card';
	import { Events, type MessageData } from '@domain/event';
	import type { User, UserId } from '@domain/user';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import Frown from 'lucide-svelte/icons/frown';
	import Lightbulb from 'lucide-svelte/icons/lightbulb';
	import Smile from 'lucide-svelte/icons/smile';
	import { onMount } from 'svelte';
	import { backInOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { loremIpsum } from 'lorem-ipsum';
	import { updateCard } from '$lib/services/updateCard';
	import { goToPreviousStep } from '$lib/services/goToPreviousStep';
	import { Undo2 } from 'lucide-svelte';
	import { deleteCard } from '$lib/services/deleteCard';

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

	if (board.users.find((u) => u.id === connectedUser.id) === undefined) {
		joinBoard(board.id);
	}
	let sortedUsers = $derived([...board.users].sort((a, b) => (a.name > b.name ? 1 : -1)));

	let cards = $derived([...board.cards].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)));

	let cardText = $state('');
	const boardId = page.params.id;
	const toastStore = getToastStore();
	onMount(() => {
		getUserFromLocalStorage();
		store.openBoardWebsocket(boardId);
		store.subscribe(async (data: MessageData | null) => {
			if (!data) return;
			console.log('Message from server:', data, data.event);
			try {
				switch (data.event) {
					case Events.CREATED_CARD: {
						const { card } = data.payload as { card: Card };
						board.cards = [card, ...cards];
						break;
					}
					case Events.UPDATED_CARD: {
						const { card } = data.payload as { card: Card };
						const index = cards.findIndex((c) => c.id === card.id);
						cards[index] = card;
						break;
					}
					case Events.DELETED_CARD: {
						const { cardId } = data.payload as { cardId: string };
						board.cards = cards.filter((c) => c.id !== cardId);
						break;
					}
					case Events.CONNECTED: {
						if (board.users.find((u) => u.id === connectedUser.id) !== undefined) break;
						board.users = [...users, connectedUser];
						break;
					}
					case Events.JOINED_BOARD: {
						const { user: newUser } = data.payload as { user: User };
						toastStore.trigger({ message: newUser.name + ' joined the board!' });
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
					case Events.VOTED_FOR_CARD: {
						const { cardId, userId, newValue } = data.payload as {
							cardId: string;
							userId: UserId;
							newValue: number;
						};
						const cardToUpdate = cards.find((c) => c.id === cardId);
						if (cardToUpdate) {
							cardToUpdate.votes[userId] = newValue;
							const otherCards = board.cards.filter((c) => c.id !== cardToUpdate.id);
							board.cards = [...otherCards, cardToUpdate];
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
		if (!cardText) {
			cardText = loremIpsum({ count: 1, units: 'sentences' });
		}
		await createCard(boardId, cardText, columnId);
		cardText = '';
	}

	async function editCard(card: Card) {
		await updateCard(boardId, card);
	}

	async function onDeleteCard(cardId: string): Promise<void> {
		await deleteCard(board.id, cardId);
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

	async function onPreviousStepClick(): Promise<void> {
		await goToPreviousStep(board.id);
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
	<!-- Users -->
	<div>
		<div class="flex gap-1">
			{#each sortedUsers as user}
				<button
					type="button"
					disabled={board.step !== BoardStep.PRESENT}
					onclick={() => (currentUserIndex = sortedUsers.findIndex((u) => u.id === user.id))}
					class="{sortedUsers[currentUserIndex].id === user.id && board.step === BoardStep.PRESENT
						? 'variant-filled-primary'
						: 'variant-filled-secondary'} btn"
				>
					{user.name}
					{#if board.step === BoardStep.VOTE}
						({board.cards.reduce((acc, card: Card) => {
							return acc + (card.votes?.[user.id] || 0);
						}, 0)})
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Steps -->
	<section class="card variant-soft-surface flex items-center justify-between p-4" id="steps">
		<h2 class="h3 text-tertiary-500">Step {steps[board.step].index}/4</h2>
		<h2 class="h3 text-tertiary-500">{steps[board.step].label}</h2>
		<div class="flex items-center gap-2">
			<button
				disabled={board.step === BoardStep.DISCUSS}
				class="variant-filled-surface btn"
				onclick={() => onNextStepClick()}>Next step</button
			>
			<button
				disabled={board.step === BoardStep.WRITE}
				class="variant-ghost-surface btn btn-icon"
				onclick={() => onPreviousStepClick()}
			>
				<Undo2 />
			</button>
		</div>
	</section>

	{#key board.step}
		<section
			id="board-content"
			aria-label="Board content"
			in:fly={{ x: '800', duration: 1000, delay: 1000, easing: backInOut }}
			out:fly={{ x: '-800', duration: 1000, easing: backInOut }}
		>
			<!-- TEXT AREA  -->
			{#if board.step === BoardStep.WRITE}
				<section
					id="card-text-area"
					aria-label="Text area for card writing"
					class="mb-4 flex justify-center"
				>
					<textarea
						bind:value={cardText}
						class="textarea w-96 p-4 text-primary-200"
						rows="4"
						placeholder="Write here..."
					></textarea>
				</section>
			{/if}

			<div class=" flex flex-grow justify-center gap-8">
				{#each columns as column}
					<div class="flex-1 flex-col items-center text-center">
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
											userName={getUserName(item.userId, sortedUsers)}
											hidden={item.userId !== connectedUser.id && shouldHideCards(board)}
											boardStep={board.step}
											highlighted={sortedUsers[currentUserIndex].id === item.userId &&
												board.step === BoardStep.PRESENT}
											canEdit={connectedUser?.id === item.userId}
											onEdit={editCard}
											onDelete={() => onDeleteCard(item.id)}
											connectedUserId={connectedUser.id}
										/>
									</li>
								{/each}
							</ul>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/key}
</section>
