import type { Position } from '@/types'

export function getMousePosition(e: MouseEvent | TouchEvent): Position {
  if ('touches' in e && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  } else if ('clientX' in e) {
    return { x: e.clientX, y: e.clientY }
  }
  return { x: 0, y: 0 }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export interface DragHandlerOptions {
  onStart?: (pos: Position) => void
  onMove?: (delta: Position, pos: Position) => void
  onEnd?: (pos: Position) => void
  button?: number
  preventDefault?: boolean
}

export function createDragHandler(
  element: HTMLElement,
  options: DragHandlerOptions
): () => void {
  let isDragging = false
  let startPos: Position | null = null
  let lastPos: Position | null = null

  const handleStart = (e: MouseEvent | TouchEvent) => {
    if ('button' in e && options.button !== undefined && e.button !== options.button) {
      return
    }
    
    isDragging = true
    startPos = getMousePosition(e)
    lastPos = { ...startPos }
    
    if (options.preventDefault) {
      e.preventDefault()
    }
    
    options.onStart?.(startPos)
    
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)
  }

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !startPos || !lastPos) return
    
    if (options.preventDefault) {
      e.preventDefault()
    }
    
    const currentPos = getMousePosition(e)
    const delta = {
      x: currentPos.x - lastPos.x,
      y: currentPos.y - lastPos.y,
    }
    
    options.onMove?.(delta, currentPos)
    lastPos = currentPos
  }

  const handleEnd = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return
    
    isDragging = false
    
    const endPos = lastPos || { x: 0, y: 0 }
    options.onEnd?.(endPos)
    
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
    
    startPos = null
    lastPos = null
  }

  element.addEventListener('mousedown', handleStart)
  element.addEventListener('touchstart', handleStart, { passive: false })

  return () => {
    element.removeEventListener('mousedown', handleStart)
    element.removeEventListener('touchstart', handleStart)
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  }
}

export interface ResizeHandlerOptions {
  handles?: string[]
  onStart?: (handle: string, pos: Position) => void
  onResize?: (handle: string, delta: Position, pos: Position) => void
  onEnd?: (handle: string, pos: Position) => void
  minWidth?: number
  minHeight?: number
}

export function createResizeHandler(
  container: HTMLElement,
  options: ResizeHandlerOptions
): () => void {
  const handles = options.handles || ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']
  const minWidth = options.minWidth || 20
  const minHeight = options.minHeight || 20
  const cleanupFns: (() => void)[] = []

  handles.forEach(handle => {
    const handleEl = document.createElement('div')
    handleEl.className = `resize-handle resize-handle-${handle}`
    handleEl.style.cssText = `
      position: absolute;
      width: 12px;
      height: 12px;
      background: white;
      border: 2px solid var(--text-primary);
      border-radius: 50%;
      z-index: 1000;
    `

    const positions: Record<string, string> = {
      n: 'top: -6px; left: 50%; transform: translateX(-50%); cursor: n-resize;',
      s: 'bottom: -6px; left: 50%; transform: translateX(-50%); cursor: s-resize;',
      e: 'right: -6px; top: 50%; transform: translateY(-50%); cursor: e-resize;',
      w: 'left: -6px; top: 50%; transform: translateY(-50%); cursor: w-resize;',
      ne: 'top: -6px; right: -6px; cursor: ne-resize;',
      nw: 'top: -6px; left: -6px; cursor: nw-resize;',
      se: 'bottom: -6px; right: -6px; cursor: se-resize;',
      sw: 'bottom: -6px; left: -6px; cursor: sw-resize;',
    }

    handleEl.style.cssText += positions[handle] || ''

    const cleanup = createDragHandler(handleEl, {
      onStart: (pos) => options.onStart?.(handle, pos),
      onMove: (delta, pos) => {
        const constrainedDelta = {
          x: delta.x,
          y: delta.y,
        }
        options.onResize?.(handle, constrainedDelta, pos)
      },
      onEnd: (pos) => options.onEnd?.(handle, pos),
      preventDefault: true,
    })

    container.appendChild(handleEl)
    cleanupFns.push(cleanup)
  })

  return () => {
    cleanupFns.forEach(fn => fn())
    container.querySelectorAll('.resize-handle').forEach(el => el.remove())
  }
}
