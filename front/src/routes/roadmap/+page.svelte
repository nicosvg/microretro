<script>
	const roadmap = [
		'add descriptions of each steps in the stepper',
		'display the list of steps on top of stepper instead of 1/4...',
		'add emoji reactions to the cards',
		'hide logout link when user is not logged in',
		'group tickets',
		'order tickets by number of votes',
		'add a timer for the write and vote pages',
		'improve confetti',
		'limit the number of votes per user',
		'allow choosing the name of the columns',
		'add a "ready" button'
	];
</script>

<div class="mx-auto">
	<h1 class="h1 my-8">Roadmap</h1>
	<ul class="list">
		{#each roadmap as item}
			<li>{item}</li>
		{/each}
	</ul>
</div>
