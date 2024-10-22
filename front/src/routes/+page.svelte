<script>
	import { goto } from '$app/navigation';

	import Login from '$lib/components/Login.svelte';
	import { createRetrospective } from '$lib/services/createRetrospective';

	async function onCreateClick() {
		const id = await createRetrospective();
		if (id) goto(`/retro/${id}`);
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<Login></Login>
	<h1 class="h1">
		<span
			class="bg-gradient-to-br from-blue-500 to-cyan-300 box-decoration-clone bg-clip-text text-transparent"
		>
			MICRORETRO
		</span>
	</h1>

	<button type="button" class="variant-filled-primary btn btn-lg" on:click={onCreateClick}>
		Create retrospective
	</button>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}
</style>
