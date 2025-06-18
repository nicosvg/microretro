<script lang="ts">
	import { BoardStep } from '@domain/board';
	import { Undo2 } from 'lucide-svelte';
	import type { UserId } from '@domain/user';

	export let boardStep: BoardStep;
	export let readyUsers: UserId[];
	export let connectedUserId: UserId;
	export let onNextStep: () => Promise<void>;
	export let onPreviousStep: () => Promise<void>;
	export let onReadyClick: () => Promise<void>;

	const steps: Record<BoardStep, { index: number; label: string }> = {
		write: { index: 1, label: 'Write' },
		present: { index: 2, label: 'Present' },
		vote: { index: 3, label: 'Vote' },
		discuss: { index: 4, label: 'Discuss' },
		done: { index: 5, label: 'Done!' }
	};
</script>

<section class="card variant-soft-surface flex items-center justify-between p-4" id="steps">
	<h2 class="h3 text-tertiary-500">Step {steps[boardStep].index}/4</h2>
	<div class="flex flex-col">
		<h2 class="h3 text-tertiary-500">{steps[boardStep].label}</h2>
		<p class="text-tertiary-400 w-96 text-sm">
			{#if boardStep === BoardStep.WRITE}
				Write down your thoughts in each column. Your cards are private and will only be revealed
				during the next step.
			{:else if boardStep === BoardStep.PRESENT}
				Present your cards to the team. Then group similar cards together.
			{:else if boardStep === BoardStep.VOTE}
				Vote on the most important topics
			{:else if boardStep === BoardStep.DISCUSS}
				Discuss the top voted items
			{:else if boardStep === BoardStep.DONE}
				Review the retrospective outcomes
			{/if}
		</p>
	</div>
	<div class="flex items-center gap-2">
		{#if boardStep === BoardStep.WRITE || boardStep === BoardStep.VOTE}
			<button
				class="variant-filled-surface btn"
				class:variant-filled-tertiary={!readyUsers.includes(connectedUserId)}
				class:variant-ghost-surface={readyUsers.includes(connectedUserId)}
				onclick={() => onReadyClick()}
			>
				{readyUsers.includes(connectedUserId) ? 'Not ready' : `I'm ready!`}
			</button>
		{/if}
		<button
			disabled={boardStep === BoardStep.DISCUSS}
			class="variant-filled-surface btn"
			onclick={() => onNextStep()}>Next step</button
		>
		<button
			disabled={boardStep === BoardStep.WRITE}
			class="variant-ghost-surface btn btn-icon"
			onclick={() => onPreviousStep()}
		>
			<Undo2 />
		</button>
	</div>
</section>
