<script lang="ts">
	import { page } from '$app/stores';
	import CardComponent from '$lib/components/Card.svelte';
	import Login from '$lib/components/Login.svelte';
	import { onMount } from 'svelte';
	import { createCard } from '../../../services/createCard';
	import store, { Events, type MessageData } from '$lib/store';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { Card } from '$lib/domain/card';
	import type { Board } from '$lib/domain/board';
	import type { User } from '$lib/domain/user';

	export let data: Board;
	console.log('loaded data', data);
	let users = data.users;

	let cards = data.cards;

	let cardText = '';
	const boardId = $page.params.id;
	const toastStore = getToastStore();

	onMount(() => {
		store.openWebsocket(boardId);
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
					case Events.JOINED_BOARD:
						console.log('JOINED_BOARD', data.payload);
						toastStore.trigger({ message: 'A new user joined the board' });
						break;
					default:
						console.error('Unknown data:', data);
				}
			} catch (e) {
				console.log('Message from server:', data, e);
			}
		});
	});

	// function onSendMessage() {
	// 	store.sendMessage(message);
	// }

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

<h1 class="h1 text-secondary-300">Retrospective board</h1>
<div>
	<input bind:value={cardText} type="text" placeholder="Add a card" />

	<button on:click={addPositive}>Add positive</button>
	<button on:click={addNegative}>Add negative</button>
</div>

<div class="columns columns-3-xs gap-8">
	<div class="column">
		<div class="retro__header my-8">
			<h2 class="h2 text-success-500">Good</h2>
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
			<h2 class="h2 text-warning-500">Bad</h2>
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
