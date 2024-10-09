<script lang="ts">
	export let card: { id: number; text: string; column?: number };
</script>

<div class="card card-hover p-4 text-primary-200">
	{card.text}
</div>
