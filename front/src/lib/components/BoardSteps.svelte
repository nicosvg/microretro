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

	const currentStepIndex = $derived(steps[boardStep].index);
</script>

<section class="card variant-soft-surface flex w-full flex-col gap-4 p-4" id="steps">
	<fragment class="flex w-full items-center">
		{#each Object.entries(steps) as [step, { index, label }]}
			<div class="flex items-center">
				<div
					class="btn-icon variant-filled flex h-8 w-8 items-center justify-center {currentStepIndex ===
					index
						? 'variant-filled-primary'
						: currentStepIndex > index
							? 'variant-filled-surface'
							: 'variant-filled-secondary'}"
				>
					{index}
				</div>
				<div
					class="text-md ml-2 {currentStepIndex === index
						? 'text-primary-300 font-semibold'
						: currentStepIndex > index
							? 'text-blue-300'
							: 'text-cyan-300'}"
				>
					{label}
				</div>
			</div>
			{#if index < Object.keys(steps).length}
				<div
					class="mx-2 h-0.5 grow {currentStepIndex > index ? 'bg-blue-100' : 'bg-blue-100'}"
				></div>
			{/if}
		{/each}
	</fragment>
	<div class="flex w-full items-center justify-between gap-4">
		<p class="text-tertiary-400 text-md w-96 grow">
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
		<div class="flex items-center gap-2">
			{#if (boardStep === BoardStep.WRITE || boardStep === BoardStep.VOTE) && !readyUsers.includes(connectedUserId)}
				<button class="variant-filled-surface btn" onclick={() => onReadyClick()}>
					{readyUsers.includes(connectedUserId) ? 'Not ready' : `I'm ready!`}
				</button>
			{/if}
			<button
				disabled={boardStep === BoardStep.DONE}
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
	</div>
</section>
