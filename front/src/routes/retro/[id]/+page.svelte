<script lang="ts">
	import { page } from '$app/stores';
	import { createCard } from '../../../services/createCard';

	const positiveCards = [{ id: 1, text: 'First positive card' }];
	let cardText = '';
	const boardId = $page.params.id;

	async function addPositive() {
		await createCard(boardId, cardText);
	}

	function addNegative() {
		throw new Error('Function not implemented.');
	}
</script>

<h1>
	<span>Retrospective board</span>
</h1>
<div>
	<input bind:value={cardText} type="text" placeholder="Add a card" />

	<button on:click={addPositive}>Add positive</button>
	<button on:click={addNegative}>Add negative</button>
</div>
<div class="retro">
	<div class="retro__header">
		<h2>What went well</h2>
	</div>
	<div class="retro__content">
		{#each positiveCards as item (item.id)}
			<div class="retro__content__item">
				{item.text}
			</div>
		{/each}
	</div>

	<div class="retro__header">
		<h2>What went wrong</h2>
	</div>
</div>

<style>
	.retro {
		display: flex;
		flex-direction: column;
	}
	.retro__header {
		display: flex;
		justify-content: space-between;
	}
	.retro__content {
		display: flex;
		flex-wrap: wrap;
	}
	.retro__content__item {
		flex: 0 0 50%;
	}
</style>
