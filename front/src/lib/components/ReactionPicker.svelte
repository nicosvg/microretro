<script lang="ts">
	import { ALLOWED_EMOJIS, type AllowedEmoji } from '@domain/reaction';
	import { onMount } from 'svelte';

	interface Props {
		onSelect: (emoji: AllowedEmoji) => void;
		onClose: () => void;
	}

	let { onSelect, onClose }: Props = $props();
	let focusedIndex = $state(0);
	let pickerElement: HTMLDivElement;

	const emojiLabels: Record<AllowedEmoji, string> = {
		'👍': 'thumbs up',
		'👎': 'thumbs down',
		'❤️': 'heart',
		'😂': 'laughing',
		'😄': 'smiling',
		'😍': 'love',
		'😢': 'sad',
		'😭': 'crying',
		'😡': 'angry',
		'😠': 'mad',
		'🤔': 'thinking',
		'😮': 'surprised',
		'💡': 'idea',
		'🎉': 'celebration',
		'🔥': 'fire',
		'⚡': 'lightning',
		'✨': 'sparkles',
		'💯': 'hundred',
		'🚀': 'rocket',
		'✅': 'check'
	};

	function handleKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			case 'Escape':
				event.preventDefault();
				onClose();
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				onSelect(ALLOWED_EMOJIS[focusedIndex]);
				break;
			case 'ArrowRight':
				event.preventDefault();
				focusedIndex = (focusedIndex + 1) % ALLOWED_EMOJIS.length;
				break;
			case 'ArrowLeft':
				event.preventDefault();
				focusedIndex = (focusedIndex - 1 + ALLOWED_EMOJIS.length) % ALLOWED_EMOJIS.length;
				break;
			case 'ArrowDown':
				event.preventDefault();
				focusedIndex = (focusedIndex + 5) % ALLOWED_EMOJIS.length;
				break;
			case 'ArrowUp':
				event.preventDefault();
				focusedIndex = (focusedIndex - 5 + ALLOWED_EMOJIS.length) % ALLOWED_EMOJIS.length;
				break;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (pickerElement && !pickerElement.contains(event.target as Node)) {
			onClose();
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('mousedown', handleClickOutside);
		pickerElement?.focus();

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	});
</script>

<div class="reaction-picker" role="dialog" aria-label="Choose reaction" bind:this={pickerElement} tabindex="-1">
	<div class="emoji-grid">
		{#each ALLOWED_EMOJIS as emoji, index}
			<button
				class="emoji-button {index === focusedIndex ? 'focused' : ''}"
				onclick={() => onSelect(emoji)}
				aria-label={emojiLabels[emoji]}
			>
				{emoji}
			</button>
		{/each}
	</div>
</div>

<style>
	.reaction-picker {
		position: absolute;
		z-index: 1000;
		background: white;
		border: 2px solid #d1d5db;
		border-radius: 12px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		padding: 0.75rem;
		margin-top: 0.25rem;
		outline: none;
		left: 0;
	}

	.emoji-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.5rem;
	}

	.emoji-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: 1px solid transparent;
		border-radius: 8px;
		background: transparent;
		cursor: pointer;
		font-size: 1.5rem;
		transition: all 0.2s;
		padding: 0;
	}

	.emoji-button:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
		transform: scale(1.15);
	}

	.emoji-button.focused {
		background: #dbeafe;
		border-color: #3b82f6;
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
</style>
