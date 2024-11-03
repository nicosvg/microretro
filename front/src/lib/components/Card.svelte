<script lang="ts">
	import type { Card } from '@domain/card';

	export let card: Card;
	export let userName: string;
	export let hidden: boolean;
</script>

<div class="card card-hover w-full p-4 text-primary-200">
	{userName} says:
	{#if hidden}
		...
	{:else}
		{card.text}
	{/if}
</div>
