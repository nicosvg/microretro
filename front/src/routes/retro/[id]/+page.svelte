<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/components/Card.svelte';
	import Login from '$lib/components/Login.svelte';
	import { createCard } from '../../../services/createCard';

	const positiveCards = [
		{ id: 1, text: 'First positive card' },
		{ id: 2, text: 'Second positive card' },
		{ id: 3, text: 'Third positive card' }
	];

	let cardText = '';
	const boardId = $page.params.id;

	async function addPositive() {
		await createCard(boardId, cardText, 0);
	}

	async function addNegative() {
		await createCard(boardId, cardText, 1);
	}
</script>

<Login></Login>

<h1 class="h1 text-secondary-300">Retrospective board</h1>
<div>
	<input bind:value={cardText} type="text" placeholder="Add a card" />

	<button on:click={addPositive}>Add positive</button>
	<button on:click={addNegative}>Add negative</button>
</div>

<div class="columns">
	<div class="column">
		<div class="retro__header">
			<h2 class="h2 text-success-500">Good</h2>
		</div>
		<div class="retro__content">
			<ul class="list">
				{#each positiveCards as item (item.id)}
					<li>
						<Card card={item} />
					</li>
				{/each}
			</ul>
		</div>
	</div>
	<div class="column">
		<div class="retro__header">
			<h2 class="h2 text-warning-500">Bad</h2>
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
