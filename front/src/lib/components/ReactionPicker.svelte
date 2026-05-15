<script lang="ts">
	import { ALLOWED_EMOJIS, type AllowedEmoji } from '@domain/reaction';
	import { onMount } from 'svelte';

	interface Props {
		onSelect: (emoji: AllowedEmoji) => void;
		onClose: () => void;
		x: number;
		y: number;
	}

	let { onSelect, onClose, x, y }: Props = $props();
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

	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
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

<div use:portal class="reaction-picker" role="dialog" aria-label="Choose reaction" bind:this={pickerElement} tabindex="-1" style="left: {x}px; top: {y}px;">
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
		position: fixed;
		z-index: 10000;
		background: rgba(20, 20, 30, 0.82);
		backdrop-filter: blur(16px) saturate(180%);
		-webkit-backdrop-filter: blur(16px) saturate(180%);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 16px;
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.45),
			0 2px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.08);
		padding: 0.75rem;
		outline: none;
	}

	.emoji-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.375rem;
	}

	.emoji-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: 1px solid transparent;
		border-radius: 10px;
		background: transparent;
		cursor: pointer;
		font-size: 1.4rem;
		transition:
			background 0.15s,
			border-color 0.15s,
			transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
			box-shadow 0.15s;
		padding: 0;
	}

	.emoji-button:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.25);
		transform: scale(1.2);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.emoji-button.focused {
		background: rgba(99, 179, 237, 0.25);
		border-color: rgba(99, 179, 237, 0.7);
		outline: 2px solid rgba(99, 179, 237, 0.5);
		outline-offset: 1px;
	}
</style>
