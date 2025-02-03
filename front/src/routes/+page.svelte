<script>
	import { goto } from '$app/navigation';

	import { createRetrospective } from '$lib/services/createRetrospective';
	import { getUserFromLocalStorage } from '$lib/userStore';

	async function onCreateClick() {
		getUserFromLocalStorage();
		const id = await createRetrospective();
		if (id) goto(`/retro/${id}`);
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="flex flex-col items-center gap-6">
	<!-- <Login></Login> -->
	<h1 class="h1 text-center">Microretro</h1>
	<h2 class="h2">Easy restrospectives for great teams</h2>

	<button type="button" class="variant-filled-primary btn btn-lg" on:click={onCreateClick}>
		Create retrospective
	</button>
</section>

<style></style>
