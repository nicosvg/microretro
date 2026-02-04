<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import BoardColumn from '$lib/components/BoardColumn.svelte';
	import BoardSteps from '$lib/components/BoardSteps.svelte';
	import BoardUsers from '$lib/components/BoardUsers.svelte';
	import ConfettiOnClick from '$lib/components/ConfettiOnClick.svelte';
	import store from '$lib/messageStore';
	import { createCard } from '$lib/services/createCard';
	import { getBoard } from '$lib/services/getBoard';
	import { goToNextStep } from '$lib/services/goToNextStep';
	import { goToPreviousStep } from '$lib/services/goToPreviousStep';
	import { joinBoard } from '$lib/services/joinBoard';
	import { markUserReady } from '$lib/services/markUserReady';
	import { getUserFromLocalStorage } from '$lib/userStore';
	import { BoardStep, type Board } from '@domain/board';
	import { type Card, type CardId } from '@domain/card';
	import { Events, type MessageData } from '@domain/event';
	import type { Group } from '@domain/group';
	import type { User, UserId } from '@domain/user';
	import type { Reaction, ReactionDTO } from '@domain/reaction';
	import { getReactions } from '$lib/services/reactions';
	import { loremIpsum } from 'lorem-ipsum';
	import Frown from 'lucide-svelte/icons/frown';
	import Lightbulb from 'lucide-svelte/icons/lightbulb';
	import Smile from 'lucide-svelte/icons/smile';
	import { onMount } from 'svelte';
	import { backInOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { toaster } from '$lib/toaster';

	interface Props {
		data: Board;
	}

	let { data }: Props = $props();
	let board: Board = $state(data);
	let users = board.users;
	let currentUserIndex = $state(0);
	let reactionsMap = $state<Map<CardId, ReactionDTO[]>>(new Map());
	const icons = [Smile, Frown, Lightbulb];
	const columns = $derived(
		board.columnNames.map((title, index) => ({
			id: index,
			title,
			icon: icons[index] || Lightbulb
		}))
	);

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
	let sortedUsers = $derived(
		[...board.users].sort((a, b) => {
			const hashA = simpleHash(board.id + a.id);
			const hashB = simpleHash(board.id + b.id);
			return hashA - hashB;
		})
	);

	let cards = $derived([...board.cards].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)));

	let cardText = $state('');
	const boardId = page.params.id;

	onMount(async () => {
		getUserFromLocalStorage();

		// Fetch initial reactions
		try {
			const reactions = await getReactions(boardId);
			const newMap = new Map<CardId, ReactionDTO[]>();
			reactions.forEach((reaction) => {
				const cardReactions = newMap.get(reaction.cardId) || [];
				cardReactions.push(reaction);
				newMap.set(reaction.cardId, cardReactions);
			});
			reactionsMap = newMap;
		} catch (error) {
			console.error('Failed to load reactions:', error);
		}

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
						board.cards = board.cards.map((c) => (c.id === card.id ? card : c));
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
						toaster.info({ title: newUser.name + ' joined the board!' });
						users.push(newUser);
						break;
					}
					case Events.CHANGED_STEP: {
						const { step } = data.payload as { step: BoardStep };
						board.step = step;
						board.readyUsers = [];
						if (step === BoardStep.VOTE || step === BoardStep.DISCUSS) {
							const newBoard = await getBoard(boardId);
							board.cards = newBoard.cards;
						}
						break;
					}
					case Events.CREATED_GROUP: {
						const { group } = data.payload as unknown as { group: Group };
						board.groups = [...board.groups, group];
						board.cards = cards.map((c) => {
							if (group.cardIds.includes(c.id)) {
								c.groupId = group.id;
							}
							return c;
						});
						break;
					}
					case Events.DELETED_GROUP: {
						const { groupId } = data.payload as { groupId: string };
						board.groups = board.groups.filter((g) => g.id !== groupId);
						board.cards = board.cards.map((c) =>
							c.groupId === groupId ? { ...c, groupId: null } : c
						);
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
					case Events.USER_READY: {
						const { userId } = data.payload as { userId: UserId };
						board.readyUsers = [...board.readyUsers, userId];
						break;
					}
					case Events.USER_UNREADY: {
						const { userId } = data.payload as { userId: UserId };
						board.readyUsers = board.readyUsers.filter((id) => id !== userId);
						break;
					}
					case Events.REACTION_UPDATED: {
						const { cardId, reactions } = data.payload as { cardId: CardId; reactions: Reaction[] };
						// Convert reactions to DTOs for current user
						const reactionDTOs: ReactionDTO[] = reactions.map((r) => ({
							id: r.id,
							cardId: r.cardId,
							emoji: r.emoji,
							count: r.userIds.length,
							hasReacted: r.userIds.includes(connectedUser.id)
						}));
						const newMap = new Map(reactionsMap);
						newMap.set(cardId, reactionDTOs);
						reactionsMap = newMap;
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

	async function onNextStepClick(): Promise<void> {
		await goToNextStep(board.id);
		invalidateAll();
	}

	async function onPreviousStepClick(): Promise<void> {
		await goToPreviousStep(board.id);
		invalidateAll();
	}

	async function onReadyClick(): Promise<void> {
		const isReady = !board.readyUsers.includes(connectedUser.id);
		await markUserReady(board.id, isReady);
	}

	function getGroupsForColumn(columnId: number): Group[] {
		return board.groups.filter((g) => g.column === columnId);
	}

	function simpleHash(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash;
		}
		return Math.abs(hash);
	}

	function hashBoardUser(boardId: string, userId: string): number {
		return simpleHash(boardId + userId);
	}
</script>

{#if board.step === BoardStep.DONE}
	<div class="flex flex-col items-center justify-center gap-4">
		<h1 class="h1 text-center text-6xl">Retrospective done!</h1>
		<h3 class="h3">Thanks for participating</h3>
	</div>
{/if}

{#if board.step === BoardStep.DONE}
	<div id="confetti">
		<ConfettiOnClick />
	</div>
{/if}

<section id="retrospective-board" aria-label="Retrospective board" class="flex flex-col gap-4">
	<BoardUsers
		users={sortedUsers}
		{currentUserIndex}
		boardStep={board.step}
		readyUsers={board.readyUsers}
		{cards}
		onUserClick={(index) => (currentUserIndex = index)}
	/>

	<BoardSteps
		boardStep={board.step}
		readyUsers={board.readyUsers}
		connectedUserId={connectedUser.id}
		onNextStep={onNextStepClick}
		onPreviousStep={onPreviousStepClick}
		{onReadyClick}
		allUsersAreReady={board.readyUsers.length === users.length}
	/>

	{#key board.step}
		<section
			id="board-content"
			aria-label="Board content"
			in:fly={{ x: '800', duration: 1000, delay: 1000, easing: backInOut }}
			out:fly={{ x: '-800', duration: 1000, easing: backInOut }}
		>
			{#if board.step === BoardStep.WRITE}
				<section
					id="card-text-area"
					aria-label="Text area for card writing"
					class="mb-4 flex justify-center"
				>
					<textarea
						bind:value={cardText}
						class="textarea text-primary-200 w-96 p-4"
						rows="4"
						placeholder="Write here..."
					></textarea>
				</section>
			{/if}

			<div class="flex grow justify-center gap-8">
				{#each columns as column}
					<BoardColumn
						columnId={column.id}
						title={column.title}
						{cards}
						groups={getGroupsForColumn(column.id)}
						boardStep={board.step}
						{sortedUsers}
						{currentUserIndex}
						connectedUserId={connectedUser.id}
						{boardId}
						{reactionsMap}
						onAddCard={addCard}
					/>
				{/each}
			</div>
		</section>
	{/key}
</section>
