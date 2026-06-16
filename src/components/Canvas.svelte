<script lang="ts">
  import { onMount, onDestroy, setContext } from 'svelte'
  import { useProjectStore } from '@/stores/project'
  import { useTapeStore } from '@/stores/tape'
  import { useBrushStore } from '@/stores/brush'
  import { useToast } from '@/utils/toast'
  import CanvasElement from './CanvasElement.svelte'
  import DrawingCanvas from './DrawingCanvas.svelte'
  import { createDragHandler, clamp } from '@/utils/drag'
  import { MACARON_COLORS, HAND_WRITING_FONTS } from '@/types'
  import type { AnyCanvasElement, NoteElement, BrushMode, ShapeType, LineStyle } from '@/types'

  const projectStore = useProjectStore()
  const tapeStore = useTapeStore()
  const brushStore = useBrushStore()
  const { showToast } = useToast()

  const {
    zoom,
    canvasWidth,
    canvasHeight,
    backgroundColor,
    backgroundPattern,
    backgroundOpacity,
    showGrid,
    gridSize,
    gridColor,
    sortedElements,
    selectedElementId,
    selectedElement,
    resetSignal,
    drawings,
  } = projectStore

  const {
    isActive: brushActive,
    mode: brushMode,
    shapeType: brushShapeType,
    color: brushColor,
    width: brushWidth,
    opacity: brushOpacity,
    lineStyle: brushLineStyle,
  } = brushStore

  let canvasContainer: HTMLElement
  let canvasContent: HTMLElement
  let isPanning = false
  let panStartX = 0
  let panStartY = 0
  let offsetX = 0
  let offsetY = 0

  const scaleRef = { value: 1 }
  setContext('canvasScale', scaleRef)

  $: scale = $zoom / 100
  $: scaleRef.value = scale
  $: elements = $sortedElements
  $: if ($resetSignal) {
    offsetX = 0
    offsetY = 0
  }

  const backgroundPatterns = [
    { id: 'none', name: '无', pattern: '' },
    { id: 'dots', name: '点阵', pattern: 'radial-gradient(circle, rgba(93, 78, 94, 0.15) 1px, transparent 1px)' },
    { id: 'grid', name: '网格', pattern: 'linear-gradient(rgba(93, 78, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(93, 78, 94, 0.1) 1px, transparent 1px)' },
    { id: 'lines', name: '横线', pattern: 'repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(93, 78, 94, 0.1) 24px, rgba(93, 78, 94, 0.1) 25px)' },
  ]

  $: currentGridSize = $gridSize
  $: currentGridColor = $gridColor
  $: currentShowGrid = $showGrid
  $: currentBackgroundOpacity = $backgroundOpacity

  const shapeOptions: { type: ShapeType; icon: string; label: string }[] = [
    { type: 'line', icon: '📏', label: '直线' },
    { type: 'arrow', icon: '➡', label: '箭头' },
    { type: 'rectangle', icon: '⬜', label: '矩形' },
    { type: 'circle', icon: '⭕', label: '圆形' },
    { type: 'heart', icon: '💖', label: '心形' },
    { type: 'star', icon: '⭐', label: '星形' },
  ]

  const lineStyleOptions: { style: LineStyle; icon: string; label: string }[] = [
    { style: 'solid', icon: '—', label: '实线' },
    { style: 'dashed', icon: '- -', label: '虚线' },
    { style: 'dotted', icon: '···', label: '点线' },
  ]

  function getPatternStyle(patternId: string): string {
    const pattern = backgroundPatterns.find(p => p.id === patternId)
    if (!pattern || patternId === 'none') return ''
    const size = currentGridSize
    if (patternId === 'dots') {
      return `${pattern.pattern.replace('20px', `${size}px`)}; background-size: ${size}px ${size}px`
    } else if (patternId === 'grid') {
      return `linear-gradient(${currentGridColor} 1px, transparent 1px), linear-gradient(90deg, ${currentGridColor} 1px, transparent 1px); background-size: ${size}px ${size}px`
    }
    return `${pattern.pattern}; background-size: 100% 25px`
  }

  function getGridOverlayStyle(): string {
    if (!currentShowGrid) return 'display: none;'
    const size = currentGridSize
    return `
      background-image: 
        linear-gradient(${currentGridColor} 1px, transparent 1px),
        linear-gradient(90deg, ${currentGridColor} 1px, transparent 1px);
      background-size: ${size}px ${size}px;
    `
  }

  function handleCanvasClick(e: MouseEvent) {
    if ($brushActive) return
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

  function toggleBrush() {
    const newState = !$brushActive
    brushStore.setActive(newState)
    if (newState) {
      brushStore.setMode('pen')
      showToast('画笔模式已开启', 'info')
    } else {
      showToast('画笔模式已关闭', 'info')
    }
  }

  function setBrushMode(m: BrushMode) {
    brushStore.setMode(m)
  }

  function handleBrushColorInput(e: Event) {
    const target = e.target as HTMLInputElement
    brushStore.setColor(target.value)
  }

  function handleBrushWidthInput(e: Event) {
    const target = e.target as HTMLInputElement
    brushStore.setWidth(Number(target.value))
  }

  function handleBrushOpacityInput(e: Event) {
    const target = e.target as HTMLInputElement
    brushStore.setOpacity(Number(target.value) / 100)
  }

  function handleClearDrawings() {
    if ($drawings.length === 0) return
    projectStore.clearDrawings()
    showToast('画笔内容已清除', 'info')
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && $brushActive) {
      brushStore.setActive(false)
      showToast('画笔模式已关闭', 'info')
      return
    }

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
  class:brush-mode={$brushActive}
>
  <div class="canvas-toolbar">
    <button class="btn btn-sm" on:click={handleAddNote} title="添加便签">
      <span>📝</span> 便签
    </button>
    <button 
      class="btn btn-sm {$brushActive ? 'btn-primary' : ''}" 
      on:click={toggleBrush} 
      title="画笔工具"
    >
      <span>🖌</span> 画笔
    </button>
    <button class="btn btn-sm" on:click={resetView} title="重置视图">
      <span>🎯</span> 重置
    </button>
    <div class="canvas-size">
      {$canvasWidth} × {$canvasHeight}
    </div>
  </div>

  {#if $brushActive}
    <div class="brush-settings-bar">
      <div class="brush-settings-group">
        <div class="mode-buttons">
          <button 
            class="mode-btn {$brushMode === 'pen' ? 'active' : ''}"
            on:click={() => setBrushMode('pen')}
            title="自由绘制"
          >
            ✏️ 画笔
          </button>
          <button 
            class="mode-btn {$brushMode === 'eraser' ? 'active' : ''}"
            on:click={() => setBrushMode('eraser')}
            title="橡皮擦"
          >
            🧹 橡皮擦
          </button>
          <button 
            class="mode-btn {$brushMode === 'shape' ? 'active' : ''}"
            on:click={() => setBrushMode('shape')}
            title="形状工具"
          >
            📐 形状
          </button>
        </div>
      </div>

      <div class="brush-settings-divider"></div>

      {#if $brushMode !== 'eraser'}
        <div class="brush-settings-group">
          <label class="setting-label">
            <span>颜色</span>
            <div class="color-picker-wrapper">
              <input 
                type="color" 
                class="brush-color-picker"
                value={$brushColor}
                on:input={handleBrushColorInput}
              />
              <span class="color-hex">{$brushColor}</span>
            </div>
          </label>
        </div>

        <div class="brush-settings-divider"></div>

        <div class="brush-settings-group">
          <label class="setting-label">
            <span>粗细</span>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={$brushWidth}
              on:input={handleBrushWidthInput}
              class="brush-slider"
            />
            <span class="setting-value">{$brushWidth}px</span>
          </label>
        </div>

        <div class="brush-settings-divider"></div>

        <div class="brush-settings-group">
          <label class="setting-label">
            <span>透明度</span>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={Math.round($brushOpacity * 100)}
              on:input={handleBrushOpacityInput}
              class="brush-slider"
            />
            <span class="setting-value">{Math.round($brushOpacity * 100)}%</span>
          </label>
        </div>

        <div class="brush-settings-divider"></div>

        <div class="brush-settings-group">
          <label class="setting-label">
            <span>线型</span>
            <div class="line-style-buttons">
              {#each lineStyleOptions as opt}
                <button 
                  class="line-style-btn {$brushLineStyle === opt.style ? 'active' : ''}"
                  on:click={() => brushStore.setLineStyle(opt.style)}
                  title={opt.label}
                >
                  {opt.icon}
                </button>
              {/each}
            </div>
          </label>
        </div>
      {:else}
        <div class="brush-settings-group">
          <label class="setting-label">
            <span>擦除大小</span>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={$brushWidth}
              on:input={handleBrushWidthInput}
              class="brush-slider"
            />
            <span class="setting-value">{$brushWidth}px</span>
          </label>
        </div>
      {/if}

      {#if $brushMode === 'shape'}
        <div class="brush-settings-divider"></div>
        <div class="brush-settings-group">
          <label class="setting-label">
            <span>形状</span>
            <div class="shape-buttons">
              {#each shapeOptions as opt}
                <button 
                  class="shape-btn {$brushShapeType === opt.type ? 'active' : ''}"
                  on:click={() => brushStore.setShapeType(opt.type)}
                  title={opt.label}
                >
                  {opt.icon}
                </button>
              {/each}
            </div>
          </label>
        </div>
      {/if}

      <div class="brush-settings-divider"></div>

      <button class="btn btn-sm btn-danger" on:click={handleClearDrawings} title="清除画笔" disabled={$drawings.length === 0}>
        🗑️ 清除笔迹
      </button>
    </div>
  {/if}

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
        opacity: {currentBackgroundOpacity};
        {getPatternStyle($backgroundPattern)}
      "
      on:click={handleCanvasClick}
    >
      <div class="grid-overlay" style="{getGridOverlayStyle()}"></div>
      {#each elements as element (element.id)}
        <CanvasElement
          element={element}
          isSelected={$selectedElementId === element.id}
          on:select={() => handleElementSelect(element.id)}
          on:update={(e) => handleElementUpdate(element.id, e.detail)}
          on:drag-end={() => handleElementDragEnd(element.id)}
        />
      {/each}

      <DrawingCanvas />

      {#if elements.length === 0 && $drawings.length === 0}
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
    {#if $drawings.length > 0}
      <span>|</span>
      <span>画笔: {$drawings.length} 笔</span>
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

    &.brush-mode {
      :global(.canvas-element) {
        pointer-events: none;
      }
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

  .brush-settings-bar {
    position: absolute;
    top: 72px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.97);
    backdrop-filter: blur(10px);
    border: 2px solid var(--text-primary);
    border-radius: var(--border-radius-lg);
    z-index: 100;
    box-shadow: var(--shadow-md);
    flex-wrap: wrap;
    max-width: 90vw;
    justify-content: center;
  }

  .brush-settings-group {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .brush-settings-divider {
    width: 1px;
    height: 28px;
    background: var(--macaron-gray);
    flex-shrink: 0;
  }

  .setting-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-hand);
    font-size: 13px;
    color: var(--text-primary);
    white-space: nowrap;

    > span:first-child {
      color: var(--text-secondary);
      font-size: 12px;
    }
  }

  .setting-value {
    font-size: 12px;
    color: var(--text-secondary);
    min-width: 36px;
    text-align: right;
    font-family: var(--font-body);
  }

  .mode-buttons {
    display: flex;
    gap: 4px;
  }

  .mode-btn {
    padding: 4px 10px;
    border: 2px solid var(--text-primary);
    border-radius: var(--border-radius-sm);
    background: var(--macaron-white);
    font-family: var(--font-hand);
    font-size: 12px;
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      background: var(--macaron-cream);
    }

    &.active {
      background: var(--macaron-pink);
      color: white;
      box-shadow: 1px 1px 0 var(--text-primary);
    }
  }

  .brush-color-picker {
    width: 28px;
    height: 28px;
    border: 2px solid var(--text-primary);
    border-radius: 50%;
    padding: 0;
    cursor: pointer;
    overflow: hidden;

    &::-webkit-color-swatch-wrapper {
      padding: 2px;
    }

    &::-webkit-color-swatch {
      border: none;
      border-radius: 50%;
    }
  }

  .color-hex {
    font-size: 11px;
    color: var(--text-secondary);
    font-family: var(--font-body);
  }

  .brush-slider {
    width: 80px;
    cursor: pointer;
  }

  .line-style-buttons {
    display: flex;
    gap: 3px;
  }

  .line-style-btn {
    padding: 3px 8px;
    border: 2px solid var(--text-primary);
    border-radius: var(--border-radius-sm);
    background: var(--macaron-white);
    font-family: var(--font-body);
    font-size: 11px;
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      background: var(--macaron-cream);
    }

    &.active {
      background: var(--macaron-blue);
      color: white;
    }
  }

  .shape-buttons {
    display: flex;
    gap: 3px;
  }

  .shape-btn {
    padding: 3px 6px;
    border: 2px solid var(--text-primary);
    border-radius: var(--border-radius-sm);
    background: var(--macaron-white);
    font-size: 14px;
    cursor: pointer;
    transition: all var(--transition-fast);
    line-height: 1;

    &:hover {
      background: var(--macaron-cream);
      transform: translateY(-1px);
    }

    &.active {
      background: var(--macaron-purple);
      box-shadow: 1px 1px 0 var(--text-primary);
    }
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

  .grid-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
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
    z-index: 0;
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
