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
	<h1 class="h1 text-center text-6xl">Microretro</h1>
	<h3 class="h3">Easy restrospectives for great teams</h3>

	<button type="button" class=" variant-filled-primary btn btn-lg mt-8" onclick={onCreateClick}>
		Create retrospective
	</button>
</section>

<style></style>
