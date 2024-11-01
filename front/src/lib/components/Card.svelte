<script lang="ts">
	import type { Card } from '@domain/card';

	export let card: Card;
	export let userName: string;
</script>

<div class="card card-hover w-full p-4 text-primary-200">
	{userName} says:
	{card.text}
</div>
