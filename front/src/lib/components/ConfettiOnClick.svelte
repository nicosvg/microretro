<script lang="ts">
	import { Confetti } from 'svelte-confetti';

	const duration = 2000;

	let things = $state([]);
	let timeout: number;

	async function moveConfetti(event: MouseEvent) {
		const { target, clientX, clientY } = event;

		const elementY = target.getBoundingClientRect().top;
		const elementX = target.getBoundingClientRect().left;

		const x = clientX - elementX;
		const y = clientY - elementY;

		things = [...things, { x, y }];

		clearTimeout(timeout);

		timeout = setTimeout(() => (things = []), duration);
	}
</script>

<div class="box" onclick={moveConfetti}>
	{#each things as thing}
		<div class="mover" style="left: {thing.x}px; top: {thing.y}px">
			<Confetti y={[-0.5, 0.5]} fallDistance="20px" amount="10" {duration} />
		</div>
	{/each}
</div>

<style>
	.box {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		right: 0;
		background: transparent;
		user-select: none;
		z-index: 0;
	}

	.mover {
		position: absolute;
	}

	span {
		pointer-events: none;
	}
</style>
