<script lang="ts">
	import { goto } from '$app/navigation';
	import { createRetrospective } from '$lib/services/createRetrospective';
	import { getUserFromLocalStorage } from '$lib/userStore';
	import messageStore from '$lib/messageStore';
	import { DEFAULT_COLUMN_NAMES } from '@domain/board';

	let columnNames = $state([...DEFAULT_COLUMN_NAMES]);

	async function onCreateClick() {
		getUserFromLocalStorage();
		messageStore.reset();
		const id = await createRetrospective(columnNames);
		if (id) goto(`/retro/${id}`, { invalidateAll: true });
	}

	function updateColumnName(index: number, value: string) {
		columnNames[index] = value;
	}
</script>

<svelte:head>
	<title>Setup Retrospective</title>
	<meta name="description" content="Configure your retrospective columns" />
</svelte:head>

<section class="flex grow flex-col items-center justify-center gap-6">
	<h1 class="h1 text-center text-4xl">Setup Your Retrospective</h1>
	<h3 class="h3">Customize your column names</h3>

	<div class="flex w-full max-w-md flex-col gap-4">
		{#each columnNames as columnName, index}
			<div class="flex flex-col gap-2">
				<label for="column-{index}" class="text-sm font-medium">Column {index + 1}</label>
				<input
					id="column-{index}"
					type="text"
					bind:value={columnNames[index]}
					class="input input-bordered w-full"
					placeholder="Enter column name"
				/>
			</div>
		{/each}
	</div>

	<button
		type="button"
		class="btn btn-lg btn-primary mt-8"
		onclick={onCreateClick}
		disabled={columnNames.some((name) => !name.trim())}
	>
		Create Retrospective
	</button>
</section>
