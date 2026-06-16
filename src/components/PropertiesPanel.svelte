<script lang="ts">
  import { useProjectStore } from '@/stores/project'
  import { MACARON_COLORS, HAND_WRITING_FONTS, DEFAULT_CATEGORIES } from '@/types'
  import { useToast } from '@/utils/toast'
  import type { AnyCanvasElement, NoteElement } from '@/types'

  const projectStore = useProjectStore()
  const { showToast } = useToast()

  const {
    selectedElement,
    canvasWidth,
    canvasHeight,
    backgroundColor,
    backgroundPattern,
    currentCategory,
    categories
  } = projectStore

  let activeTab = 'element'

  $: hasSelection = $selectedElement !== null
  $: currentCanvasWidth = $canvasWidth
  $: currentCanvasHeight = $canvasHeight
  $: currentBackgroundColor = $backgroundColor
  $: currentBackgroundPattern = $backgroundPattern
  $: currentCategoryValue = $currentCategory
  $: currentCategories = $categories
  $: currentNote = hasSelection && $selectedElement?.type === 'note' ? ($selectedElement as NoteElement) : null

  const backgroundPatterns = [
    { id: 'none', name: '无' },
    { id: 'dots', name: '点阵' },
    { id: 'grid', name: '网格' },
    { id: 'lines', name: '横线' },
  ]

  const canvasPresets = [
    { name: 'A4竖版', width: 800, height: 1131 },
    { name: 'A4横版', width: 1131, height: 800 },
    { name: 'A5竖版', width: 566, height: 800 },
    { name: '正方形', width: 800, height: 800 },
    { name: '手账本', width: 600, height: 900 },
  ]

  const macaronColorList = [
    { name: '樱花粉', value: MACARON_COLORS.pink },
    { name: '浅粉', value: MACARON_COLORS.pinkLight },
    { name: '天空蓝', value: MACARON_COLORS.blue },
    { name: '浅蓝', value: MACARON_COLORS.blueLight },
    { name: '薰衣草', value: MACARON_COLORS.purple },
    { name: '浅紫', value: MACARON_COLORS.purpleLight },
    { name: '薄荷绿', value: MACARON_COLORS.green },
    { name: '浅绿', value: MACARON_COLORS.greenLight },
    { name: '柠檬黄', value: MACARON_COLORS.yellow },
    { name: '浅黄', value: MACARON_COLORS.yellowLight },
    { name: '蜜桃橙', value: MACARON_COLORS.orange },
    { name: '浅橙', value: MACARON_COLORS.orangeLight },
    { name: '米色', value: MACARON_COLORS.beige },
    { name: '奶油', value: MACARON_COLORS.cream },
    { name: '白色', value: MACARON_COLORS.white },
  ]

  function updateCanvasSize(width: number, height: number) {
    projectStore.setCanvasSize(width, height)
  }

  function handleCanvasWidthInput(e: Event) {
    const target = e.target as HTMLInputElement
    projectStore.setCanvasSize(Number(target.value), currentCanvasHeight)
  }

  function handleCanvasHeightInput(e: Event) {
    const target = e.target as HTMLInputElement
    projectStore.setCanvasSize(currentCanvasWidth, Number(target.value))
  }

  function handleBackgroundColorInput(e: Event) {
    const target = e.target as HTMLInputElement
    projectStore.setBackgroundColor(target.value)
  }

  function handleElementXInput(e: Event) {
    const target = e.target as HTMLInputElement
    updateElementProperty('x', Number(target.value))
  }

  function handleElementYInput(e: Event) {
    const target = e.target as HTMLInputElement
    updateElementProperty('y', Number(target.value))
  }

  function handleElementWidthInput(e: Event) {
    const target = e.target as HTMLInputElement
    updateElementProperty('width', Number(target.value))
  }

  function handleElementHeightInput(e: Event) {
    const target = e.target as HTMLInputElement
    updateElementProperty('height', Number(target.value))
  }

  function handleElementRotationInput(e: Event) {
    const target = e.target as HTMLInputElement
    updateElementProperty('rotation', Number(target.value))
  }

  function handleElementOpacityInput(e: Event) {
    const target = e.target as HTMLInputElement
    updateElementProperty('opacity', Number(target.value) / 100)
  }

  function handleNoteFontFamilyChange(e: Event) {
    const target = e.target as HTMLSelectElement
    updateElementProperty('fontFamily', target.value)
  }

  function handleNoteFontSizeInput(e: Event) {
    const target = e.target as HTMLInputElement
    updateElementProperty('fontSize', Number(target.value))
  }

  function handleNoteColorInput(e: Event) {
    const target = e.target as HTMLInputElement
    updateElementProperty('color', target.value)
  }

  function handleNoteBackgroundColorInput(e: Event) {
    const target = e.target as HTMLInputElement
    updateElementProperty('backgroundColor', target.value)
  }

  function updateElementProperty(key: string, value: any) {
    if ($selectedElement) {
      projectStore.updateElement($selectedElement.id, { [key]: value })
    }
  }

  function handleLockToggle() {
    if ($selectedElement) {
      const newLocked = !$selectedElement.locked
      projectStore.updateElement($selectedElement.id, { locked: newLocked })
      showToast(newLocked ? '元素已锁定' : '元素已解锁', 'info')
    }
  }

  function handleBringToFront() {
    if ($selectedElement) {
      projectStore.bringToFront($selectedElement.id)
      showToast('已置于顶层', 'info')
    }
  }

  function handleSendToBack() {
    if ($selectedElement) {
      projectStore.sendToBack($selectedElement.id)
      showToast('已置于底层', 'info')
    }
  }

  function handleMoveForward() {
    if ($selectedElement) {
      projectStore.moveForward($selectedElement.id)
      showToast('已上移一层', 'info')
    }
  }

  function handleMoveBackward() {
    if ($selectedElement) {
      projectStore.moveBackward($selectedElement.id)
      showToast('已下移一层', 'info')
    }
  }

  function handleDuplicate() {
    if ($selectedElement) {
      projectStore.duplicateElement($selectedElement.id)
      showToast('元素已复制', 'success')
    }
  }

  function handleDelete() {
    if ($selectedElement && confirm('确定要删除这个元素吗？')) {
      projectStore.deleteElement($selectedElement.id)
      showToast('元素已删除', 'info')
    }
  }

  function handleClearCanvas() {
    if (confirm('确定要清空画布吗？此操作不可撤销。')) {
      projectStore.clearCanvas()
      showToast('画布已清空', 'info')
    }
  }

  function handleResetCanvas() {
    if (confirm('确定要重置画板吗？这将清空所有内容并恢复默认设置，此操作不可撤销。')) {
      projectStore.resetProject()
      showToast('画板已重置为默认配置', 'success')
    }
  }
</script>

<div class="properties-panel panel">
  <div class="panel-header">
    <h3>⚙️ 属性设置</h3>
  </div>
  
  <div class="tabs">
    <button 
      class="tab-btn {activeTab === 'canvas' ? 'active' : ''}"
      on:click={() => activeTab = 'canvas'}
    >
      📄 画布
    </button>
    <button 
      class="tab-btn {activeTab === 'element' ? 'active' : ''}"
      on:click={() => activeTab = 'element'}
      class:disabled={!hasSelection}
    >
      🎨 元素 {hasSelection ? `(${$selectedElement?.type})` : ''}
    </button>
  </div>

  <div class="panel-body scrollbar" style="flex: 1; overflow-y: auto;">
    {#if activeTab === 'canvas'}
      <div class="section">
        <h4 class="section-title">画布尺寸</h4>
        <div class="preset-grid">
          {#each canvasPresets as preset}
            <button 
              class="preset-btn"
              class:active={currentCanvasWidth === preset.width && currentCanvasHeight === preset.height}
              on:click={() => updateCanvasSize(preset.width, preset.height)}
            >
              {preset.name}
              <span class="preset-size">{preset.width}×{preset.height}</span>
            </button>
          {/each}
        </div>
        <div class="size-inputs">
          <div class="input-group">
            <label>宽度</label>
            <input 
              type="number" 
              class="input" 
              value={currentCanvasWidth}
              on:input={handleCanvasWidthInput}
              min="100"
              max="4000"
            />
          </div>
          <div class="input-group">
            <label>高度</label>
            <input 
              type="number" 
              class="input" 
              value={currentCanvasHeight}
              on:input={handleCanvasHeightInput}
              min="100"
              max="4000"
            />
          </div>
        </div>
      </div>

      <div class="section">
        <h4 class="section-title">背景颜色</h4>
        <div class="color-grid">
          {#each macaronColorList as color}
            <button 
              class="color-swatch"
              style="background: {color.value}"
              title={color.name}
              on:click={() => projectStore.setBackgroundColor(color.value)}
              class:active={currentBackgroundColor === color.value}
            />
          {/each}
          <div class="color-picker-wrapper">
            <input 
              type="color" 
              class="color-picker"
              value={currentBackgroundColor}
              on:input={handleBackgroundColorInput}
            />
            <span class="picker-label">自定义</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h4 class="section-title">背景图案</h4>
        <div class="pattern-grid">
          {#each backgroundPatterns as pattern}
            <button 
              class="pattern-btn"
              class:active={currentBackgroundPattern === pattern.id}
              on:click={() => projectStore.setBackgroundPattern(pattern.id)}
            >
              {pattern.name}
            </button>
          {/each}
        </div>
      </div>

      <div class="section">
        <h4 class="section-title">分类</h4>
        <div class="category-list">
          {#each currentCategories as category}
            <button 
              class="category-btn"
              class:active={currentCategoryValue.id === category.id}
              style="--cat-color: {category.color}"
              on:click={() => projectStore.setCategory(category)}
            >
              <span class="cat-dot"></span>
              {category.name}
            </button>
          {/each}
        </div>
      </div>

      <div class="section">
        <div class="action-grid">
          <button class="btn btn-sm btn-warning" on:click={handleClearCanvas}>
            🗑️ 清空画布
          </button>
          <button class="btn btn-sm btn-danger" on:click={handleResetCanvas}>
            🔄 重置画板
          </button>
        </div>
      </div>
    {:else if activeTab === 'element'}
      {#if !hasSelection}
        <div class="empty-selection">
          <div class="empty-icon">👆</div>
          <p>选择画布上的元素来编辑属性</p>
        </div>
      {:else}
        <div class="section">
          <h4 class="section-title">
            位置与大小
            <span class="element-type-tag">{$selectedElement.type}</span>
          </h4>
          <div class="grid-2">
            <div class="input-group">
              <label>X</label>
              <input 
                type="number" 
                class="input" 
                value={Math.round($selectedElement.x)}
                on:input={handleElementXInput}
              />
            </div>
            <div class="input-group">
              <label>Y</label>
              <input 
                type="number" 
                class="input" 
                value={Math.round($selectedElement.y)}
                on:input={handleElementYInput}
              />
            </div>
            <div class="input-group">
              <label>宽度</label>
              <input 
                type="number" 
                class="input" 
                value={Math.round($selectedElement.width)}
                on:input={handleElementWidthInput}
                min="20"
              />
            </div>
            <div class="input-group">
              <label>高度</label>
              <input 
                type="number" 
                class="input" 
                value={Math.round($selectedElement.height)}
                on:input={handleElementHeightInput}
                min="20"
              />
            </div>
          </div>
        </div>

        <div class="section">
          <h4 class="section-title">变换</h4>
          <div class="grid-2">
            <div class="input-group">
              <label>旋转角度</label>
              <input 
                type="number" 
                class="input" 
                value={Math.round($selectedElement.rotation)}
                on:input={handleElementRotationInput}
                min="-180"
                max="180"
              />
            </div>
            <div class="input-group">
              <label>不透明度</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={Math.round($selectedElement.opacity * 100)}
                on:input={handleElementOpacityInput}
              />
              <span class="range-value">{Math.round($selectedElement.opacity * 100)}%</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h4 class="section-title">图层顺序</h4>
          <div class="action-grid">
            <button class="btn btn-sm" on:click={handleBringToFront} title="置于顶层">
              ⬆️ 顶层
            </button>
            <button class="btn btn-sm" on:click={handleSendToBack} title="置于底层">
              ⬇️ 底层
            </button>
            <button class="btn btn-sm" on:click={handleMoveForward} title="上移一层">
              ↑ 上移
            </button>
            <button class="btn btn-sm" on:click={handleMoveBackward} title="下移一层">
              ↓ 下移
            </button>
          </div>
        </div>

        <div class="section">
          <h4 class="section-title">操作</h4>
          <div class="action-grid">
            <button 
              class="btn btn-sm {$selectedElement.locked ? 'btn-warning' : ''}" 
              on:click={handleLockToggle}
            >
              {$selectedElement.locked ? '🔓 解锁' : '🔒 锁定'}
            </button>
            <button class="btn btn-sm btn-secondary" on:click={handleDuplicate}>
              📋 复制
            </button>
            <button class="btn btn-sm btn-danger" on:click={handleDelete}>
              🗑️ 删除
            </button>
          </div>
        </div>

        {#if currentNote}
          <div class="section">
            <h4 class="section-title">文字样式</h4>
            <div class="input-group">
              <label>字体</label>
              <select 
                class="select"
                value={currentNote.fontFamily}
                on:change={handleNoteFontFamilyChange}
              >
                {#each HAND_WRITING_FONTS as font}
                  <option value={font}>{font}</option>
                {/each}
              </select>
            </div>
            <div class="input-group">
              <label>字号</label>
              <input 
                type="number" 
                class="input" 
                value={currentNote.fontSize}
                on:input={handleNoteFontSizeInput}
                min="8"
                max="120"
              />
            </div>
            <div class="color-row">
              <span class="color-label">文字颜色</span>
              <input 
                type="color" 
                class="color-picker"
                value={currentNote.color}
                on:input={handleNoteColorInput}
              />
            </div>
            <div class="color-row">
              <span class="color-label">背景颜色</span>
              <input 
                type="color" 
                class="color-picker"
                value={currentNote.backgroundColor}
                on:input={handleNoteBackgroundColorInput}
              />
            </div>
            <div class="input-group">
              <label>对齐方式</label>
              <div class="align-buttons">
                <button 
                  class="align-btn {currentNote.textAlign === 'left' ? 'active' : ''}"
                  on:click={() => updateElementProperty('textAlign', 'left')}
                >
                  ⬅
                </button>
                <button 
                  class="align-btn {currentNote.textAlign === 'center' ? 'active' : ''}"
                  on:click={() => updateElementProperty('textAlign', 'center')}
                >
                  ⬌
                </button>
                <button 
                  class="align-btn {currentNote.textAlign === 'right' ? 'active' : ''}"
                  on:click={() => updateElementProperty('textAlign', 'right')}
                >
                  ➡
                </button>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    {/if}
  </div>
</div>

<style lang="scss">
  .properties-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .tabs {
    display: flex;
    padding: 8px 12px;
    gap: 8px;
    border-bottom: 2px dashed var(--macaron-gray);
  }

  .tab-btn {
    flex: 1;
    padding: 8px 12px;
    border: 2px solid var(--text-primary);
    border-radius: var(--border-radius-sm);
    background: var(--macaron-cream);
    font-family: var(--font-hand);
    font-size: 14px;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &.active {
      background: var(--macaron-pink);
      color: white;
      box-shadow: 2px 2px 0 var(--text-primary);
    }
    
    &:hover:not(.active):not(.disabled) {
      background: var(--macaron-white);
      transform: translateY(-1px);
    }
    
    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .section {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    font-family: var(--font-hand);
    font-size: 16px;
    color: var(--text-primary);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .element-type-tag {
    font-size: 12px;
    padding: 2px 8px;
    background: var(--macaron-blue);
    color: white;
    border-radius: 10px;
    font-family: var(--font-body);
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    label {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    input[type="range"] {
      width: 100%;
      cursor: pointer;
    }
    
    .range-value {
      font-size: 12px;
      color: var(--text-secondary);
      text-align: right;
    }
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }

  .preset-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 10px;
    border: 2px solid var(--text-primary);
    border-radius: var(--border-radius-sm);
    background: var(--macaron-white);
    font-family: var(--font-hand);
    font-size: 13px;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover {
      background: var(--macaron-cream);
      transform: translateY(-1px);
    }
    
    &.active {
      background: var(--macaron-pink);
      color: white;
    }
    
    .preset-size {
      font-size: 10px;
      opacity: 0.7;
      font-family: var(--font-body);
    }
  }

  .size-inputs {
    display: flex;
    gap: 10px;
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }

  .color-swatch {
    width: 100%;
    aspect-ratio: 1;
    border: 2px solid var(--text-primary);
    border-radius: 8px;
    cursor: pointer;
    transition: all var(--transition-fast);
    padding: 0;
    
    &:hover {
      transform: scale(1.1);
    }
    
    &.active {
      box-shadow: 0 0 0 3px var(--text-primary);
    }
  }

  .color-picker-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    
    .picker-label {
      font-size: 10px;
      color: var(--text-secondary);
    }
  }

  .pattern-grid {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .pattern-btn {
    flex: 1;
    min-width: 70px;
    padding: 8px;
    border: 2px solid var(--text-primary);
    border-radius: var(--border-radius-sm);
    background: var(--macaron-white);
    font-family: var(--font-hand);
    font-size: 13px;
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

  .category-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .category-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 2px solid var(--text-primary);
    border-radius: 20px;
    background: var(--macaron-white);
    font-family: var(--font-hand);
    font-size: 13px;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    .cat-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--cat-color);
      border: 1px solid var(--text-primary);
    }
    
    &:hover {
      background: var(--cat-color);
    }
    
    &.active {
      background: var(--cat-color);
      box-shadow: 2px 2px 0 var(--text-primary);
    }
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .empty-selection {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    
    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }
    
    p {
      font-family: var(--font-hand);
      font-size: 15px;
      color: var(--text-secondary);
    }
  }

  .color-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
    
    .color-label {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }

  .align-buttons {
    display: flex;
    gap: 4px;
    
    .align-btn {
      flex: 1;
      padding: 6px;
      border: 2px solid var(--text-primary);
      border-radius: var(--border-radius-sm);
      background: var(--macaron-white);
      cursor: pointer;
      transition: all var(--transition-fast);
      
      &:hover {
        background: var(--macaron-cream);
      }
      
      &.active {
        background: var(--macaron-green);
      }
    }
  }

  .btn-danger {
    background: #ff6b6b !important;
    color: white !important;
    
    &:hover {
      background: #ff5252 !important;
    }
  }

  .w-full {
    width: 100%;
  }
</style>
