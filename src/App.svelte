<script lang="ts">
  import { onMount } from 'svelte'
  import { useProjectStore } from '@/stores/project'
  import { useTapeStore } from '@/stores/tape'
  import { loadTapes } from '@/services/tauri'
  import Header from '@/components/Header.svelte'
  import TapeLibrary from '@/components/TapeLibrary.svelte'
  import Canvas from '@/components/Canvas.svelte'
  import PropertiesPanel from '@/components/PropertiesPanel.svelte'
  import ProjectManager from '@/components/ProjectManager.svelte'
  import { useToast, toasts } from '@/utils/toast'

  const projectStore = useProjectStore()
  const tapeStore = useTapeStore()
  const { showToast } = useToast()

  let showProjectManager = false

  onMount(async () => {
    try {
      const tapes = await loadTapes()
      tapeStore.loadTapes(tapes)
    } catch (e) {
      console.error('Failed to load tapes:', e)
    }
  })

  function handleOpenProjects() {
    showProjectManager = true
  }

  function handleCloseProjects() {
    showProjectManager = false
  }
</script>

<div class="app-container">
  <Header 
    on:open-projects={handleOpenProjects}
  />
  
  <div class="main-content">
    <aside class="left-sidebar">
      <TapeLibrary />
    </aside>
    
    <main class="canvas-area">
      <Canvas />
    </main>
    
    <aside class="right-sidebar">
      <PropertiesPanel />
    </aside>
  </div>

  {#if showProjectManager}
    <ProjectManager on:close={handleCloseProjects} />
  {/if}

  <div id="toast-container">
    {#each $toasts as toast (toast.id)}
      <div 
        class="toast animate-fadeIn"
        style="--toast-bg: {toast.type === 'success' ? 'var(--macaron-green)' : toast.type === 'error' ? 'var(--macaron-pink)' : toast.type === 'warning' ? 'var(--macaron-yellow)' : 'var(--macaron-blue)'}"
      >
        <span class="toast-icon">{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : toast.type === 'warning' ? '⚠' : 'ℹ'}</span>
        <span class="toast-message">{toast.message}</span>
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .app-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    padding: 12px;
    gap: 12px;
  }

  .left-sidebar {
    width: 260px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .canvas-area {
    flex: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: 
      radial-gradient(circle at 20% 30%, rgba(255, 182, 193, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(135, 206, 235, 0.3) 0%, transparent 50%),
      linear-gradient(135deg, var(--macaron-cream) 0%, var(--macaron-pink-light) 100%);
    border-radius: var(--border-radius-lg);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 30px;
      right: 30px;
      bottom: 20px;
      border: 3px dashed rgba(93, 78, 94, 0.15);
      border-radius: calc(var(--border-radius-lg) - 10px);
      pointer-events: none;
    }
  }

  .right-sidebar {
    width: 280px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  @media (max-width: 1200px) {
    .left-sidebar {
      width: 220px;
    }
    .right-sidebar {
      width: 240px;
    }
  }

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

  :global(.toast) {
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

  :global(.toast-icon) {
    font-size: 18px;
    font-weight: bold;
  }

  :global(.toast-message) {
    flex: 1;
  }
</style>
