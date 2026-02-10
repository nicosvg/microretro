<script>
	const changelog = [
		{
			date: '2026-02-02',
			changes: ['Fix disappearing cards when loading voting step']
		},
		{
			date: '2026-02-08',
			changes: ['Migrate to Skeleton UI v4']
		},
		{
			date: '2025-09-09',
			changes: ['Add setup page with configurable column names']
		},
		{
			date: '2025-08-05',
			changes: ['New theme with Skeleton 3']
		},
		{
			date: '2025-06-19',
			changes: ['Sort users randomly']
		},
		{
			date: '2025-06-18',
			changes: ['Add ready button', 'Add steps workflow visualization']
		},
		{
			date: '2025-05-23',
			changes: ['Group cards']
		},
		{
			date: '2025-03-05',
			changes: ['Sort cards by vote number in Discuss step']
		},
		{
			date: '2025-02-25',
			changes: ['Show number of votes near user name']
		},
		{
			date: '2025-02-22',
			changes: ['Delete a card', 'Add roadmap page']
		},
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
		},
		{
			date: '2025-02-05',
			changes: [
				"Highlight a user's cards in present step",
				'Added confetti (not shared with other users)'
			]
		},
		{
			date: '2024-11-06',
			changes: ['Added voting on cards', 'Show votes count on cards on step discuss']
		},
		{
			date: '2024-10-21',
			changes: ['Join a board']
		}
	].sort((a, b) => (a.date < b.date ? 1 : -1));
</script>

<div class="mx-auto max-w-2xl p-4">
	<h1 class="h1 mb-8">Changelog</h1>
	{#each changelog as entry}
		<div class="mb-4 flex gap-8">
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
