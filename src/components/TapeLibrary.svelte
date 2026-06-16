<script lang="ts">
  import { onMount } from 'svelte'
  import { useTapeStore } from '@/stores/tape'
  import { useProjectStore } from '@/stores/project'
  import { importTapeDialog, deleteTape as deleteTapeService } from '@/services/tauri'
  import { useToast } from '@/utils/toast'
  import type { TapeAsset } from '@/types'

  const tapeStore = useTapeStore()
  const projectStore = useProjectStore()
  const { showToast } = useToast()

  const { sortedTapes } = tapeStore
  const { zoom } = projectStore

  let searchQuery = ''
  let draggingTape: TapeAsset | null = null

  $: filteredTapes = $sortedTapes.filter(tape => 
    tape.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function handleImport() {
    const tape = await importTapeDialog()
    if (tape) {
      tapeStore.addTape({
        name: tape.name,
        data: tape.data,
        width: tape.width,
        height: tape.height,
      })
      showToast('胶带素材导入成功！', 'success')
    }
  }

  async function handleDelete(tape: TapeAsset, e: Event) {
    e.stopPropagation()
    if (confirm(`确定要删除胶带「${tape.name}」吗？`)) {
      const success = await deleteTapeService(tape.id)
      if (success) {
        tapeStore.removeTape(tape.id)
        showToast('胶带已删除', 'info')
      }
    }
  }

  function handleDragStart(tape: TapeAsset, e: DragEvent) {
    draggingTape = tape
    e.dataTransfer?.setData('text/plain', tape.id)
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'copy'
    }
  }

  function handleDragEnd() {
    draggingTape = null
  }

  function handleAddToCanvas(tape: TapeAsset) {
    const aspectRatio = tape.width / tape.height
    const defaultHeight = 60
    const defaultWidth = defaultHeight * aspectRatio

    projectStore.addElement({
      type: 'tape',
      tapeId: tape.id,
      x: 100,
      y: 100,
      width: defaultWidth,
      height: defaultHeight,
      rotation: Math.random() * 6 - 3,
      opacity: 0.9,
      locked: false,
      repeat: true,
    })

    showToast(`已添加胶带「${tape.name}」到画布`, 'success')
  }

  function handleCanvasDragOver(e: DragEvent) {
    if (draggingTape) {
      e.preventDefault()
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy'
      }
    }
  }

  function handleCanvasDrop(e: DragEvent) {
    if (draggingTape && e.dataTransfer) {
      e.preventDefault()
      
      const canvasEl = document.querySelector('.canvas-content')
      if (!canvasEl) return
      
      const rect = canvasEl.getBoundingClientRect()
      const scale = $zoom / 100
      const x = (e.clientX - rect.left) / scale
      const y = (e.clientY - rect.top) / scale

      const aspectRatio = draggingTape.width / draggingTape.height
      const defaultHeight = 60
      const defaultWidth = defaultHeight * aspectRatio

      projectStore.addElement({
        type: 'tape',
        tapeId: draggingTape.id,
        x: x - defaultWidth / 2,
        y: y - defaultHeight / 2,
        width: defaultWidth,
        height: defaultHeight,
        rotation: Math.random() * 6 - 3,
        opacity: 0.9,
        locked: false,
        repeat: true,
      })

      showToast(`已添加胶带「${draggingTape.name}」`, 'success')
      draggingTape = null
    }
  }

  onMount(() => {
    const canvasArea = document.querySelector('.canvas-area')
    if (canvasArea) {
      canvasArea.addEventListener('dragover', handleCanvasDragOver)
      canvasArea.addEventListener('drop', handleCanvasDrop)
    }

    return () => {
      if (canvasArea) {
        canvasArea.removeEventListener('dragover', handleCanvasDragOver)
        canvasArea.removeEventListener('drop', handleCanvasDrop)
      }
    }
  })
</script>

<div class="tape-library panel">
  <div class="panel-header">
    <h3>🎀 胶带素材库</h3>
    <button class="btn btn-sm btn-primary" on:click={handleImport}>
      <span>+</span> 导入
    </button>
  </div>
  
  <div class="panel-body" style="display: flex; flex-direction: column; gap: 12px; height: 100%; overflow: hidden;">
    <input
      type="text"
      class="input"
      placeholder="🔍 搜索胶带..."
      bind:value={searchQuery}
    />
    
    <div class="tape-list scrollbar">
      {#if filteredTapes.length === 0}
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <p class="empty-text">
            {searchQuery ? '没有找到匹配的胶带' : '还没有胶带素材'}
          </p>
          <button class="btn btn-sm btn-primary" on:click={handleImport}>
            导入第一张胶带
          </button>
        </div>
      {:else}
        {#each filteredTapes as tape (tape.id)}
          <div 
            class="tape-item {draggingTape?.id === tape.id ? 'dragging' : ''}"
            draggable="true"
            on:dragstart={(e) => handleDragStart(tape, e)}
            on:dragend={handleDragEnd}
            on:dblclick={() => handleAddToCanvas(tape)}
          >
            <div class="tape-preview">
              <img src={tape.data} alt={tape.name} />
            </div>
            <div class="tape-info">
              <span class="tape-name">{tape.name}</span>
              <span class="tape-size">{tape.width} × {tape.height}</span>
            </div>
            <button 
              class="delete-btn"
              title="删除"
              on:click={(e) => handleDelete(tape, e)}
            >
              ✕
            </button>
          </div>
        {/each}
      {/if}
    </div>

    <div class="library-tip">
      💡 双击胶带或拖拽到画布添加
    </div>
  </div>
</div>

<style lang="scss">
  .tape-library {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .tape-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 4px;
  }

  .tape-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: var(--macaron-cream);
    border: 2px solid var(--text-primary);
    border-radius: var(--border-radius-md);
    cursor: grab;
    transition: all var(--transition-fast);
    position: relative;
    
    &:hover {
      transform: translateX(4px);
      background: var(--macaron-white);
      box-shadow: var(--shadow-sm);
    }
    
    &:active {
      cursor: grabbing;
    }
    
    &.dragging {
      opacity: 0.5;
      transform: scale(0.98);
    }
  }

  .tape-preview {
    width: 60px;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid var(--text-secondary);
    background: repeating-linear-gradient(
      45deg,
      var(--macaron-white),
      var(--macaron-white) 5px,
      var(--macaron-gray) 5px,
      var(--macaron-gray) 10px
    );
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .tape-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .tape-name {
    font-family: var(--font-hand);
    font-size: 15px;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tape-size {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .delete-btn {
    width: 24px;
    height: 24px;
    border: none;
    background: var(--macaron-pink);
    color: white;
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all var(--transition-fast);
    
    &:hover {
      background: #ff6b6b;
      transform: scale(1.1);
    }
  }

  .tape-item:hover .delete-btn {
    opacity: 1;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  .empty-text {
    font-family: var(--font-hand);
    font-size: 15px;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  .library-tip {
    padding: 8px 12px;
    background: var(--macaron-yellow-light);
    border-radius: var(--border-radius-sm);
    font-size: 12px;
    color: var(--text-secondary);
    text-align: center;
    font-family: var(--font-hand);
  }
</style>
