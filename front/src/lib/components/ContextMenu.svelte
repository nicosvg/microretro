<script lang="ts">
  interface MenuItem {
    label: string;
    onClick: () => void;
  }

  interface Props {
    x: number;
    y: number;
    items: MenuItem[];
    onClose: () => void;
  }

  let { x, y, items, onClose }: Props = $props();
  let menuRef: HTMLDivElement | null = null;

  function handleWindowClick(e: MouseEvent) {
    // Only close if click is outside the menu
    if (menuRef && !menuRef.contains(e.target as Node)) {
      onClose();
    }
  }
</script>

<!-- Click outside to close -->
<svelte:window onclick={handleWindowClick} />

<div
  bind:this={menuRef}
  class="context-menu fixed z-50 rounded-lg bg-surface-800 shadow-lg border border-surface-700"
  style="left: {x}px; top: {y}px;"
  onmousedown={(e) => e.stopPropagation()}
  ondragstart={(e) => e.preventDefault()}
>
  {#each items as item}
    <button
      draggable="false"
      class="w-full px-4 py-2 text-left hover:bg-surface-700 first:rounded-t-lg last:rounded-b-lg"
      onclick={(e) => {
        console.log('Menu item clicked:', item.label);
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        item.onClick();
        onClose();
      }}
    >
      {item.label}
    </button>
  {/each}
</div>

<style>
  .context-menu {
    min-width: 150px;
  }
</style>
