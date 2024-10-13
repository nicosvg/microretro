<script lang="ts">
	import type { Card } from '$lib/domain/card';

	export let card: Card;
</script>

<div class="card card-hover w-full p-4 text-primary-200">
	{card.text}
</div>
