<script lang="ts">
  import { toasts, getIcon, getBgColor } from '@/utils/toast'
</script>

{#each $toasts as toast (toast.id)}
  <div 
    class="toast animate-fadeIn"
    style="--toast-bg: {getBgColor(toast.type)}"
  >
    <span class="toast-icon">{getIcon(toast.type)}</span>
    <span class="toast-message">{toast.message}</span>
  </div>
{/each}

<style lang="scss">
  :global(#toast-container) {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    background: var(--toast-bg, var(--macaron-blue));
    border: 2px solid var(--text-primary);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-md);
    font-family: var(--font-hand);
    font-size: 15px;
    color: var(--text-primary);
    min-width: 200px;
    transform-origin: top right;
  }

  .toast-icon {
    font-size: 18px;
    font-weight: bold;
  }

  .toast-message {
    flex: 1;
  }
</style>
