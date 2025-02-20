<script>
	const changelog = [
		{
			date: '2025-02-16',
			changes: [
				'Added transitions',
				'When creating and empty card, the text is now replaced by a lorem ipsum (for testing purposes)'
			]
		},
		{
			date: '2025-02-19',
			changes: ['Added card edition', 'Added changelog page']
		},
		{
			date: '2025-02-20',
			changes: ['Added go to previous step']
		}
	].sort((a, b) => (a.date < b.date ? 1 : -1));
</script>

<div class="mx-auto max-w-2xl p-4">
	{#each changelog as entry}
		<div class="mb-8 flex gap-8">
			<header class="whitespace-nowrap">
				<h1>{entry.date}</h1>
			</header>
			<div class="">
				<ul class="list">
					{#each entry.changes as change}
						<li class="mb-2">{change}</li>
					{/each}
				</ul>
			</div>
		</div>
	{/each}
</div>
