<script>
	import { goto } from '$app/navigation';

	function onCreateClick() {
		goto('/setup');
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="flex grow flex-col items-center justify-center gap-6">
	<h1 class="h1 text-center text-6xl">Microretro</h1>
	<h3 class="h3">Easy restrospectives for great teams</h3>

	<button type="button" class=" preset-filled-primary-500 btn btn-lg mt-8" onclick={onCreateClick}>
		Create retrospective
	</button>
</section>
