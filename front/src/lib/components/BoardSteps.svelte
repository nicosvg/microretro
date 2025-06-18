<script lang="ts">
	import { BoardStep } from '@domain/board';
	import { Undo2 } from 'lucide-svelte';
	import type { UserId } from '@domain/user';

	type BoardStepProps = {
		boardStep: BoardStep;
		readyUsers: UserId[];
		connectedUserId: UserId;
		onNextStep: () => Promise<void>;
		onPreviousStep: () => Promise<void>;
		onReadyClick: () => Promise<void>;
		allUsersAreReady: boolean;
	};

	let {
		boardStep,
		readyUsers,
		connectedUserId,
		onNextStep,
		onPreviousStep,
		onReadyClick,
		allUsersAreReady
	}: BoardStepProps = $props();

	const steps: Record<BoardStep, { index: number; label: string }> = {
		[BoardStep.WRITE]: { index: 1, label: 'Write' },
		[BoardStep.PRESENT]: { index: 2, label: 'Present' },
		[BoardStep.VOTE]: { index: 3, label: 'Vote' },
		[BoardStep.DISCUSS]: { index: 4, label: 'Discuss' },
		[BoardStep.DONE]: { index: 5, label: 'Done!' }
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
		{#if (boardStep === BoardStep.WRITE || boardStep === BoardStep.VOTE) && !readyUsers.includes(connectedUserId)}
			<button class="variant-filled-surface btn" onclick={() => onReadyClick()}>
				{readyUsers.includes(connectedUserId) ? 'Not ready' : `I'm ready!`}
			</button>
		{/if}
		<button
			disabled={boardStep === BoardStep.DISCUSS}
			class="{allUsersAreReady ? 'variant-filled-success' : 'variant-filled-surface'} btn"
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
