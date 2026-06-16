import { writable } from 'svelte/store'
import type { BrushMode, ShapeType, LineStyle } from '@/types'

function createBrushStore() {
  const isActive = writable(false)
  const mode = writable<BrushMode>('pen')
  const shapeType = writable<ShapeType>('line')
  const color = writable('#5D4E5E')
  const width = writable(3)
  const opacity = writable(1)
  const lineStyle = writable<LineStyle>('solid')

  function setActive(active: boolean) {
    isActive.set(active)
    if (!active) {
      mode.set('pen')
    }
  }

  function setMode(m: BrushMode) {
    mode.set(m)
  }

  function setShapeType(t: ShapeType) {
    shapeType.set(t)
  }

  function setColor(c: string) {
    color.set(c)
  }

  function setWidth(w: number) {
    width.set(Math.max(1, Math.min(20, w)))
  }

  function setOpacity(o: number) {
    opacity.set(Math.max(0.1, Math.min(1, o)))
  }

  function setLineStyle(s: LineStyle) {
    lineStyle.set(s)
  }

  return {
    isActive,
    mode,
    shapeType,
    color,
    width,
    opacity,
    lineStyle,
    setActive,
    setMode,
    setShapeType,
    setColor,
    setWidth,
    setOpacity,
    setLineStyle,
  }
}

const _brushInstance = createBrushStore()
export function useBrushStore() {
  return _brushInstance
}
