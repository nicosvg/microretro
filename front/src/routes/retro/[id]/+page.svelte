<script lang="ts">
	import { page } from '$app/stores';
	import CardComponent from '$lib/components/Card.svelte';
	import Login from '$lib/components/Login.svelte';
	import { onMount } from 'svelte';
	import { Events, type MessageData } from '$lib/domain/Events';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { Card } from '$lib/domain/card';
	import type { Board } from '$lib/domain/board';
	import type { User } from '$lib/domain/user';
	import { joinBoard } from '$lib/services/joinBoard';
	import store from '$lib/store';
	import { createCard } from '$lib/services/createCard';

	export let data: Board;
	console.log('loaded data', data);
	let users = data.users;

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

	console.log('connectedUser', connectedUser);

	if (users.find((u) => u.id === connectedUser.id) === undefined) {
		joinBoard(data.id);
	}

	let cards = data.cards;

	let cardText = '';
	const boardId = $page.params.id;
	const toastStore = getToastStore();

	onMount(() => {
		store.openBoardWebsocket(boardId);
		store.subscribe((data: MessageData) => {
			console.log('Received message', data);
			if (!data) return;
			try {
				switch (data.event) {
					case Events.CREATED_CARD: {
						console.log('CREATED_CARD', data.payload);
						const { card } = data.payload as { card: Card };
						cards = [...cards, card];
						console.log('cards', cards);
						break;
					}
					case Events.CONNECTED: {
						console.log('CONNECTED user', data.payload);
						break;
					}
					case Events.JOINED_BOARD: {
						console.log('JOINED_BOARD', data.payload);
						const { user: newUser } = data.payload as { user: User };
						toastStore.trigger({ message: 'A new user joined the board! Welcome ' + newUser.name });
						users.push(newUser);
						break;
					}
					default:
						console.error('Unknown data:', data);
				}
			} catch (e) {
				console.log('Message from server:', data, e);
			}
		});
	});

	async function addPositive() {
		await createCard(boardId, cardText, 0);
	}

	async function addNegative() {
		await createCard(boardId, cardText, 1);
	}

	function getUserName(userId: string, users: User[]): string {
		const user = users.find((u) => u !== null && userId === u.id);
		if (!user) return 'Unknown';
		return user.name;
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
<div>
	<textarea
		bind:value={cardText}
		class="textarea m-4 text-primary-200"
		rows="4"
		placeholder="Add a card"
	/>

	<button class="variant-filled btn" on:click={addPositive}>Add positive</button>
	<button class="variant-filled btn" on:click={addNegative}>Add negative</button>
</div>

<div class="columns columns-3-xs gap-8">
	<div class="column">
		<div class="retro__header my-8">
			<h2 class="h2 text-tertiary-500">Good</h2>
		</div>
		<div class="retro__content">
			<ul class="list">
				{#each cards.filter((c) => c?.column === 0) as item (item.id)}
					<li>
						<CardComponent card={item} userName={getUserName(item.userId, users)} />
					</li>
				{/each}
			</ul>
		</div>
	</div>
	<div class="column">
		<div class="retro__header my-8">
			<h2 class="h2 text-tertiary-500">Bad</h2>
			<ul class="list">
				{#each cards.filter((c) => c?.column === 1) as item (item.id)}
					<li>
						<CardComponent card={item} userName={getUserName(item.userId, users)} />
					</li>
				{/each}
			</ul>
		</div>
	</div>
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
