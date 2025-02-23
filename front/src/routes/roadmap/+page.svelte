<script>
	const roadmap = [
		'add descriptions of each steps in the stepper',
		'display the list of steps on top of stepper instead of 1/4...',
		'add emoji reactions to the cards',
		'hide logout link when user is not logged in'
	];
</script>

<h1>Roadmap</h1>
<ul>
	{#each roadmap as item}
		<li>{item}</li>
	{/each}
</ul>
