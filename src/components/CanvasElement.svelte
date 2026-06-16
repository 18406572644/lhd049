<script lang="ts">
  import { onMount, onDestroy, getContext } from 'svelte'
  import { useTapeStore } from '@/stores/tape'
  import { createDragHandler, createResizeHandler, clamp } from '@/utils/drag'
  import type { AnyCanvasElement, TapeElement, NoteElement, TapeAsset } from '@/types'
  import { createEventDispatcher } from 'svelte'
  import { get } from 'svelte/store'

  const dispatch = createEventDispatcher()
  const tapeStore = useTapeStore()
  const { tapes } = tapeStore

  export let element: AnyCanvasElement
  export let isSelected: boolean

  let elementRef: HTMLElement
  let resizeContainer: HTMLElement
  let isEditing = false
  let cleanupDrag: (() => void) | null = null
  let cleanupResize: (() => void) | null = null
  let initialX: number
  let initialY: number
  let dragX: number
  let dragY: number
  let initialWidth: number
  let initialHeight: number
  let resizeWidth: number
  let resizeHeight: number
  let resizeX: number
  let resizeY: number
  let aspectRatio: number
  let isDragging = false
  let isResizing = false

  const canvasScale: { value: number } = getContext('canvasScale') || { value: 1 }

  $: tapeId = element.type === 'tape' ? (element as TapeElement).tapeId : null
  $: tape = tapeId ? $tapes.find((t: TapeAsset) => t.id === tapeId) || null : null
  $: isLocked = element.locked
  $: note = element.type === 'note' ? (element as NoteElement) : null
  $: displayX = isDragging ? dragX : element.x
  $: displayY = isDragging ? dragY : element.y
  $: displayWidth = isResizing ? resizeWidth : element.width
  $: displayHeight = isResizing ? resizeHeight : element.height
  $: displayLeft = isResizing ? resizeX : element.x
  $: displayTop = isResizing ? resizeY : element.y

  function getTapeStyle() {
    if (element.type !== 'tape' || !tape) return ''
    
    return `
      background-image: url('${tape.data}');
      background-size: ${displayHeight * (tape.width / tape.height)}px ${displayHeight}px;
      background-repeat: repeat-x;
      background-position: center;
    `
  }

  function handleMouseDown(e: MouseEvent) {
    if (isLocked) return
    e.stopPropagation()
    dispatch('select')
  }

  function handleDoubleClick(e: MouseEvent) {
    if (isLocked) return
    e.stopPropagation()
    
    if (element.type === 'note') {
      isEditing = true
      const noteEl = elementRef.querySelector('.note-content') as HTMLElement
      if (noteEl) {
        noteEl.focus()
        const range = document.createRange()
        range.selectNodeContents(noteEl)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }
  }

  function handleNoteInput(e: Event) {
    const target = e.target as HTMLElement
    const text = target.innerText
    dispatch('update', { text })
  }

  function handleNoteBlur() {
    isEditing = false
  }

  function handleNoteKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      isEditing = false
      ;(e.target as HTMLElement).blur()
    }
  }

  function setupDrag() {
    if (cleanupDrag) cleanupDrag()
    if (!elementRef || isLocked) return

    cleanupDrag = createDragHandler(elementRef, {
      onStart: () => {
        initialX = element.x
        initialY = element.y
        dragX = element.x
        dragY = element.y
        isDragging = true
      },
      onMove: (delta) => {
        const scale = canvasScale.value
        dragX = initialX + delta.x / scale
        dragY = initialY + delta.y / scale
      },
      onEnd: () => {
        const finalX = dragX
        const finalY = dragY
        isDragging = false
        dispatch('update', { x: finalX, y: finalY })
        dispatch('drag-end')
      },
      button: 0,
      preventDefault: false,
    })
  }

  function setupResize() {
    if (cleanupResize) cleanupResize()
    if (!resizeContainer || !isSelected || isLocked) return

    aspectRatio = element.width / element.height

    cleanupResize = createResizeHandler(resizeContainer, {
      handles: ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'],
      minWidth: 20,
      minHeight: 20,
      onStart: () => {
        initialWidth = element.width
        initialHeight = element.height
        initialX = element.x
        initialY = element.y
        resizeWidth = element.width
        resizeHeight = element.height
        resizeX = element.x
        resizeY = element.y
        isResizing = true
      },
      onResize: (handle, delta) => {
        const scale = canvasScale.value
        let newWidth = initialWidth
        let newHeight = initialHeight
        let newX = initialX
        let newY = initialY

        if (handle.includes('e')) {
          newWidth = clamp(initialWidth + delta.x / scale, 20, 2000)
        }
        if (handle.includes('w')) {
          const widthDelta = delta.x / scale
          newWidth = clamp(initialWidth - widthDelta, 20, 2000)
          newX = initialX + (initialWidth - newWidth)
        }
        if (handle.includes('s')) {
          newHeight = clamp(initialHeight + delta.y / scale, 20, 2000)
        }
        if (handle.includes('n')) {
          const heightDelta = delta.y / scale
          newHeight = clamp(initialHeight - heightDelta, 20, 2000)
          newY = initialY + (initialHeight - newHeight)
        }

        resizeWidth = newWidth
        resizeHeight = newHeight
        resizeX = newX
        resizeY = newY
      },
      onEnd: () => {
        const finalWidth = resizeWidth
        const finalHeight = resizeHeight
        const finalX = resizeX
        const finalY = resizeY
        isResizing = false
        dispatch('update', {
          width: finalWidth,
          height: finalHeight,
          x: finalX,
          y: finalY,
        })
      },
    })
  }

  $: if (elementRef && !isLocked) {
    setupDrag()
  }

  $: if (isSelected && !isLocked) {
    setupResize()
  } else if (cleanupResize) {
    cleanupResize()
    cleanupResize = null
  }

  onDestroy(() => {
    if (cleanupDrag) cleanupDrag()
    if (cleanupResize) cleanupResize()
  })
</script>

<div
  class="canvas-element {element.type} {isSelected ? 'selected' : ''} {isLocked ? 'locked' : ''} {isDragging ? 'is-dragging' : ''} {isResizing ? 'is-resizing' : ''}"
  bind:this={elementRef}
  style="
    left: {displayX}px;
    top: {displayY}px;
    width: {displayWidth}px;
    height: {displayHeight}px;
    transform: rotate({element.rotation}deg);
    z-index: {element.zIndex};
    opacity: {element.opacity};
    {element.type === 'tape' ? getTapeStyle() : ''}
  "
  on:mousedown={handleMouseDown}
  on:dblclick={handleDoubleClick}
>
  {#if element.type === 'tape'}
    <div class="tape-edges">
      <div class="tape-edge left"></div>
      <div class="tape-edge right"></div>
    </div>
  {/if}

  {#if note}
    <div 
      class="note-content"
      contenteditable={isEditing}
      suppressContentEditableWarning={true}
      style="
        font-size: {note.fontSize}px;
        font-family: {note.fontFamily};
        color: {note.color};
        background-color: {note.backgroundColor};
        border-color: {note.borderColor};
        text-align: {note.textAlign};
        padding: {note.padding}px;
      "
      on:input={handleNoteInput}
      on:blur={handleNoteBlur}
      on:keydown={handleNoteKeyDown}
    >{note.text}</div>
  {/if}

  {#if isSelected && !isLocked}
    <div class="selection-frame" bind:this={resizeContainer}>
      <div class="rotation-handle" title="旋转">
        <span>↻</span>
      </div>
    </div>
  {/if}

  {#if isLocked}
    <div class="lock-indicator">
      <span>🔒</span>
    </div>
  {/if}
</div>

<style lang="scss">
  .canvas-element {
    position: absolute;
    cursor: move;
    user-select: none;
    transition: box-shadow 0.15s ease, filter 0.15s ease;
    
    &:hover {
      filter: brightness(1.05);
    }
    
    &.selected {
      box-shadow: 0 0 0 3px var(--macaron-pink), 0 0 20px rgba(255, 182, 193, 0.5);
    }
    
    &.locked {
      cursor: not-allowed;
      
      &:hover {
        filter: none;
      }
    }
    
    &.tape {
      border-radius: 2px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    &.note {
      border-radius: 4px;
      overflow: hidden;
    }
    
    &.is-dragging {
      cursor: grabbing;
      box-shadow: 0 8px 25px rgba(93, 78, 94, 0.3);
      transition: none;
    }
    
    &.is-resizing {
      cursor: nwse-resize;
      box-shadow: 0 8px 25px rgba(93, 78, 94, 0.3);
      transition: none;
    }
  }

  .tape-edges {
    position: absolute;
    inset: 0;
    pointer-events: none;
    
    .tape-edge {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 12px;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 3px,
        rgba(255, 255, 255, 0.4) 3px,
        rgba(255, 255, 255, 0.4) 6px
      );
      
      &.left {
        left: 0;
      }
      
      &.right {
        right: 0;
      }
    }
  }

  .note-content {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border: 2px dashed currentColor;
    border-radius: 4px;
    overflow: hidden;
    word-wrap: break-word;
    word-break: break-word;
    outline: none;
    
    &[contenteditable="true"] {
      cursor: text;
      box-shadow: 0 0 0 2px var(--macaron-blue);
    }
  }

  .selection-frame {
    position: absolute;
    inset: -8px;
    pointer-events: none;
    
    .rotation-handle {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 24px;
      background: var(--macaron-white);
      border: 2px solid var(--text-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      pointer-events: auto;
      font-size: 14px;
      
      &:hover {
        background: var(--macaron-pink);
        color: white;
      }
      
      &:active {
        cursor: grabbing;
      }
    }
  }

  .lock-indicator {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: var(--macaron-gray);
    border: 2px solid var(--text-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
  }
</style>
