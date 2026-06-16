<script lang="ts">
  import { onMount, onDestroy, setContext } from 'svelte'
  import { useProjectStore } from '@/stores/project'
  import { useTapeStore } from '@/stores/tape'
  import { useToast } from '@/utils/toast'
  import CanvasElement from './CanvasElement.svelte'
  import { createDragHandler, clamp } from '@/utils/drag'
  import { MACARON_COLORS, HAND_WRITING_FONTS } from '@/types'
  import type { AnyCanvasElement, NoteElement } from '@/types'

  const projectStore = useProjectStore()
  const tapeStore = useTapeStore()
  const { showToast } = useToast()

  const {
    zoom,
    canvasWidth,
    canvasHeight,
    backgroundColor,
    backgroundPattern,
    sortedElements,
    selectedElementId,
    selectedElement,
    resetSignal
  } = projectStore

  let canvasContainer: HTMLElement
  let canvasContent: HTMLElement
  let isPanning = false
  let panStartX = 0
  let panStartY = 0
  let offsetX = 0
  let offsetY = 0

  $: scale = $zoom / 100
  $: scaleRef.value = scale
  $: elements = $sortedElements
  $: if ($resetSignal) {
    offsetX = 0
    offsetY = 0
  }

  const scaleRef = { value: 1 }
  setContext('canvasScale', scaleRef)

  const backgroundPatterns = [
    { id: 'none', name: '无', pattern: '' },
    { id: 'dots', name: '点阵', pattern: 'radial-gradient(circle, rgba(93, 78, 94, 0.15) 1px, transparent 1px)' },
    { id: 'grid', name: '网格', pattern: 'linear-gradient(rgba(93, 78, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(93, 78, 94, 0.1) 1px, transparent 1px)' },
    { id: 'lines', name: '横线', pattern: 'repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(93, 78, 94, 0.1) 24px, rgba(93, 78, 94, 0.1) 25px)' },
  ]

  function getPatternStyle(patternId: string): string {
    const pattern = backgroundPatterns.find(p => p.id === patternId)
    if (!pattern || patternId === 'none') return ''
    return `${pattern.pattern}; background-size: ${patternId === 'dots' ? '20px 20px' : patternId === 'grid' ? '30px 30px' : '100% 25px'}`
  }

  function handleCanvasClick(e: MouseEvent) {
    if (e.target === canvasContent || (e.target as HTMLElement).classList.contains('canvas-content')) {
      projectStore.selectElement(null)
    }
  }

  function handleCanvasMouseDown(e: MouseEvent) {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      isPanning = true
      panStartX = e.clientX - offsetX
      panStartY = e.clientY - offsetY
      e.preventDefault()
    }
  }

  function handleCanvasMouseMove(e: MouseEvent) {
    if (isPanning) {
      offsetX = e.clientX - panStartX
      offsetY = e.clientY - panStartY
      e.preventDefault()
    }
  }

  function handleCanvasMouseUp() {
    isPanning = false
  }

  function handleWheel(e: WheelEvent) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -10 : 10
      projectStore.setZoom($zoom + delta)
    }
  }

  function handleAddNote() {
    const noteElement: NoteElement = {
      type: 'note',
      x: 150,
      y: 150,
      width: 200,
      height: 120,
      rotation: Math.random() * 4 - 2,
      opacity: 1,
      locked: false,
      text: '双击编辑文字...',
      fontSize: 16,
      fontFamily: HAND_WRITING_FONTS[0],
      color: '#5D4E5E',
      backgroundColor: MACARON_COLORS.yellowLight,
      borderColor: MACARON_COLORS.yellow,
      textAlign: 'left',
      padding: 12,
    }
    
    projectStore.addElement(noteElement as any)
    showToast('已添加文字便签', 'success')
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!$selectedElementId) return
    
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      projectStore.deleteElement($selectedElementId)
      showToast('元素已删除', 'info')
      e.preventDefault()
    } else if (e.key === '[' && e.ctrlKey) {
      projectStore.moveBackward($selectedElementId)
      e.preventDefault()
    } else if (e.key === ']' && e.ctrlKey) {
      projectStore.moveForward($selectedElementId)
      e.preventDefault()
    } else if (e.key === 'd' && e.ctrlKey) {
      projectStore.duplicateElement($selectedElementId)
      showToast('元素已复制', 'success')
      e.preventDefault()
    }
  }

  function handleElementSelect(id: string) {
    projectStore.selectElement(id)
  }

  function handleElementUpdate(id: string, updates: Partial<AnyCanvasElement>) {
    projectStore.updateElement(id, updates)
  }

  function handleElementDragEnd(id: string) {
    showToast('位置已保存', 'info')
  }

  function resetView() {
    offsetX = 0
    offsetY = 0
    projectStore.setZoom(100)
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousemove', handleCanvasMouseMove)
    window.addEventListener('mouseup', handleCanvasMouseUp)
  })

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('mousemove', handleCanvasMouseMove)
    window.removeEventListener('mouseup', handleCanvasMouseUp)
  })
</script>

<div 
  class="canvas-container"
  bind:this={canvasContainer}
  on:mousedown={handleCanvasMouseDown}
  on:wheel={handleWheel}
  class:is-panning={isPanning}
>
  <div class="canvas-toolbar">
      <button class="btn btn-sm" on:click={handleAddNote} title="添加便签">
        <span>📝</span> 便签
      </button>
      <button class="btn btn-sm" on:click={resetView} title="重置视图">
        <span>🎯</span> 重置
      </button>
      <div class="canvas-size">
        {$canvasWidth} × {$canvasHeight}
      </div>
    </div>

  <div 
      class="canvas-wrapper"
      style="transform: translate({offsetX}px, {offsetY}px) scale({scale});"
    >
      <div 
        class="canvas-content"
        bind:this={canvasContent}
        style="
          width: {$canvasWidth}px;
          height: {$canvasHeight}px;
          background-color: {$backgroundColor};
          {getPatternStyle($backgroundPattern)}
        "
        on:click={handleCanvasClick}
      >
      {#each elements as element (element.id)}
        <CanvasElement
          element={element}
          isSelected={$selectedElementId === element.id}
          on:select={() => handleElementSelect(element.id)}
          on:update={(e) => handleElementUpdate(element.id, e.detail)}
          on:drag-end={() => handleElementDragEnd(element.id)}
        />
      {/each}

      {#if elements.length === 0}
        <div class="canvas-empty">
          <div class="empty-decorations">
            <span class="deco deco-1">🎀</span>
            <span class="deco deco-2">✨</span>
            <span class="deco deco-3">🌸</span>
            <span class="deco deco-4">💖</span>
          </div>
          <p class="empty-title">开始创作你的手账吧！</p>
          <p class="empty-subtitle">从左侧拖拽胶带到画布，或添加便签文字</p>
          <div class="empty-hints">
            <span>💡 双击胶带快速添加</span>
            <span>💡 Alt+拖拽平移画布</span>
            <span>💡 Ctrl+滚轮缩放</span>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="canvas-footer">
    <span>图层: {elements.length} 个元素</span>
    <span>|</span>
    <span>缩放: {$zoom}%</span>
    {#if $selectedElementId}
      <span>|</span>
      <span>已选中: {$selectedElement?.type}</span>
    {/if}
  </div>
</div>

<style lang="scss">
  .canvas-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    cursor: default;
    
    &.is-panning {
      cursor: grabbing;
    }
  }

  .canvas-toolbar {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 2px solid var(--text-primary);
    border-radius: var(--border-radius-lg);
    z-index: 100;
    box-shadow: var(--shadow-md);
  }

  .canvas-size {
    font-family: var(--font-hand);
    font-size: 14px;
    color: var(--text-secondary);
    padding-left: 10px;
    border-left: 2px dashed var(--macaron-gray);
  }

  .canvas-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: center center;
    transition: transform 0.1s ease-out;
  }

  .canvas-content {
    position: relative;
    border: 3px solid var(--text-primary);
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(93, 78, 94, 0.2);
    overflow: hidden;
    transition: box-shadow 0.2s ease;
    
    &:hover {
      box-shadow: 0 15px 50px rgba(93, 78, 94, 0.25);
    }
  }

  .canvas-empty {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px;
    pointer-events: none;
  }

  .empty-decorations {
    position: relative;
    width: 100px;
    height: 100px;
    margin-bottom: 20px;
    
    .deco {
      position: absolute;
      font-size: 32px;
      
      &.deco-1 {
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        animation: float 3s ease-in-out infinite;
      }
      
      &.deco-2 {
        top: 30%;
        right: 0;
        animation: float 3s ease-in-out infinite 0.5s;
      }
      
      &.deco-3 {
        bottom: 10%;
        right: 20%;
        animation: float 3s ease-in-out infinite 1s;
      }
      
      &.deco-4 {
        bottom: 0;
        left: 20%;
        animation: float 3s ease-in-out infinite 1.5s;
      }
    }
  }

  .empty-title {
    font-family: var(--font-hand);
    font-size: 28px;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .empty-subtitle {
    font-size: 15px;
    color: var(--text-secondary);
    margin-bottom: 24px;
  }

  .empty-hints {
    display: flex;
    flex-direction: column;
    gap: 6px;
    
    span {
      font-size: 13px;
      color: var(--text-light);
    }
  }

  .canvas-footer {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 16px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid var(--macaron-gray);
    border-radius: 20px;
    font-size: 12px;
    color: var(--text-secondary);
    font-family: var(--font-hand);
    z-index: 100;
  }
</style>
