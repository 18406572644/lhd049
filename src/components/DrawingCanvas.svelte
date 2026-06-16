<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { useProjectStore } from '@/stores/project'
  import { useBrushStore } from '@/stores/brush'
  import { v4 as uuidv4 } from 'uuid'
  import type { DrawingStroke, ShapeType, Position } from '@/types'

  const projectStore = useProjectStore()
  const brushStore = useBrushStore()

  const {
    canvasWidth,
    canvasHeight,
    drawings,
  } = projectStore

  const {
    isActive,
    mode,
    shapeType,
    color,
    width,
    opacity,
    lineStyle,
  } = brushStore

  let canvas: HTMLCanvasElement
  let ctx: CanvasRenderingContext2D
  let isDrawing = false
  let currentPoints: Position[] = []
  let shiftKey = false
  let previewStroke: DrawingStroke | null = null

  function getCanvasPoint(e: MouseEvent | Touch): Position {
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) * ($canvasWidth / rect.width),
      y: (e.clientY - rect.top) * ($canvasHeight / rect.height),
    }
  }

  function getLineDash(style: string, w: number): number[] {
    if (style === 'dashed') return [w * 3, w * 2]
    if (style === 'dotted') return [w, w * 2]
    return []
  }

  function drawStroke(context: CanvasRenderingContext2D, stroke: DrawingStroke) {
    context.save()
    context.globalAlpha = stroke.opacity
    context.strokeStyle = stroke.color
    context.lineWidth = stroke.width
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.setLineDash(getLineDash(stroke.lineStyle, stroke.width))

    if (stroke.type === 'freehand') {
      if (stroke.points.length < 2) {
        context.restore()
        return
      }
      context.beginPath()
      context.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (let i = 1; i < stroke.points.length; i++) {
        const prev = stroke.points[i - 1]
        const curr = stroke.points[i]
        const mx = (prev.x + curr.x) / 2
        const my = (prev.y + curr.y) / 2
        context.quadraticCurveTo(prev.x, prev.y, mx, my)
      }
      const last = stroke.points[stroke.points.length - 1]
      context.lineTo(last.x, last.y)
      context.stroke()
    } else {
      drawShape(context, stroke)
    }

    context.restore()
  }

  function drawShape(context: CanvasRenderingContext2D, stroke: DrawingStroke) {
    if (stroke.points.length < 2) return
    const start = stroke.points[0]
    const end = stroke.points[stroke.points.length - 1]
    let sx = start.x, sy = start.y
    let ex = end.x, ey = end.y

    if (shiftKey && !['heart', 'star'].includes(stroke.type)) {
      if (stroke.type === 'rectangle' || stroke.type === 'circle') {
        const size = Math.max(Math.abs(ex - sx), Math.abs(ey - sy))
        ex = sx + size * Math.sign(ex - sx || 1)
        ey = sy + size * Math.sign(ey - sy || 1)
      } else if (stroke.type === 'line' || stroke.type === 'arrow') {
        const dx = ex - sx
        const dy = ey - sy
        const angle = Math.atan2(dy, dx)
        const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4)
        const dist = Math.sqrt(dx * dx + dy * dy)
        ex = sx + Math.cos(snappedAngle) * dist
        ey = sy + Math.sin(snappedAngle) * dist
      }
    }

    context.beginPath()

    switch (stroke.type) {
      case 'line':
        context.moveTo(sx, sy)
        context.lineTo(ex, ey)
        context.stroke()
        break

      case 'arrow': {
        context.moveTo(sx, sy)
        context.lineTo(ex, ey)
        context.stroke()
        const angle = Math.atan2(ey - sy, ex - sx)
        const headLen = Math.max(stroke.width * 4, 16)
        context.beginPath()
        context.moveTo(ex, ey)
        context.lineTo(
          ex - headLen * Math.cos(angle - Math.PI / 6),
          ey - headLen * Math.sin(angle - Math.PI / 6)
        )
        context.moveTo(ex, ey)
        context.lineTo(
          ex - headLen * Math.cos(angle + Math.PI / 6),
          ey - headLen * Math.sin(angle + Math.PI / 6)
        )
        context.stroke()
        break
      }

      case 'rectangle':
        context.strokeRect(sx, sy, ex - sx, ey - sy)
        break

      case 'circle': {
        const cx = (sx + ex) / 2
        const cy = (sy + ey) / 2
        const rx = Math.abs(ex - sx) / 2
        const ry = Math.abs(ey - sy) / 2
        context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        context.stroke()
        break
      }

      case 'heart': {
        const cx = (sx + ex) / 2
        const cy = (sy + ey) / 2
        const size = Math.max(Math.abs(ex - sx), Math.abs(ey - sy)) / 2
        const topY = cy - size * 0.4
        context.moveTo(cx, cy + size)
        context.bezierCurveTo(cx - size * 1.5, cy, cx - size, topY - size * 0.4, cx, topY + size * 0.2)
        context.bezierCurveTo(cx + size, topY - size * 0.4, cx + size * 1.5, cy, cx, cy + size)
        context.stroke()
        break
      }

      case 'star': {
        const cx = (sx + ex) / 2
        const cy = (sy + ey) / 2
        const outerR = Math.max(Math.abs(ex - sx), Math.abs(ey - sy)) / 2
        const innerR = outerR * 0.4
        const points = 5
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR
          const a = (Math.PI / points) * i - Math.PI / 2
          const px = cx + r * Math.cos(a)
          const py = cy + r * Math.sin(a)
          if (i === 0) context.moveTo(px, py)
          else context.lineTo(px, py)
        }
        context.closePath()
        context.stroke()
        break
      }
    }
  }

  function redraw() {
    if (!ctx) return
    ctx.clearRect(0, 0, $canvasWidth, $canvasHeight)
    const allStrokes = [...$drawings]
    if (previewStroke) allStrokes.push(previewStroke)
    for (const stroke of allStrokes) {
      drawStroke(ctx, stroke)
    }
  }

  function handlePointerDown(e: MouseEvent | TouchEvent) {
    if (!$isActive) return
    e.stopPropagation()
    e.preventDefault()
    isDrawing = true

    const point = e instanceof MouseEvent ? getCanvasPoint(e) : getCanvasPoint(e.touches[0])
    currentPoints = [point]

    if ($mode === 'shape') {
      previewStroke = {
        id: uuidv4(),
        type: $shapeType,
        points: [point],
        color: $color,
        width: $width,
        opacity: $opacity,
        lineStyle: $lineStyle,
      }
    }
  }

  function handlePointerMove(e: MouseEvent | TouchEvent) {
    if (!isDrawing || !$isActive) return
    e.stopPropagation()
    e.preventDefault()

    const point = e instanceof MouseEvent ? getCanvasPoint(e) : getCanvasPoint(e.touches[0])

    if ($mode === 'pen') {
      currentPoints.push(point)
      previewStroke = {
        id: uuidv4(),
        type: 'freehand',
        points: [...currentPoints],
        color: $color,
        width: $width,
        opacity: $opacity,
        lineStyle: $lineStyle,
      }
    } else if ($mode === 'shape') {
      currentPoints = [currentPoints[0], point]
      if (previewStroke) {
        previewStroke = { ...previewStroke, points: [...currentPoints] }
      }
    } else if ($mode === 'eraser') {
      currentPoints.push(point)
      const eraserRadius = $width
      const toRemove: string[] = []
      for (const stroke of $drawings) {
        if (strokeHitTest(stroke, point, eraserRadius)) {
          toRemove.push(stroke.id)
        }
      }
      if (toRemove.length > 0) {
        projectStore.removeDrawings(toRemove)
      }
    }

    redraw()
  }

  function handlePointerUp(e: MouseEvent | TouchEvent) {
    if (!isDrawing || !$isActive) return
    e.stopPropagation()
    isDrawing = false

    if ($mode === 'pen' && currentPoints.length >= 2) {
      const stroke: DrawingStroke = {
        id: uuidv4(),
        type: 'freehand',
        points: [...currentPoints],
        color: $color,
        width: $width,
        opacity: $opacity,
        lineStyle: $lineStyle,
      }
      projectStore.addDrawing(stroke)
    } else if ($mode === 'shape' && currentPoints.length >= 2) {
      if (previewStroke) {
        projectStore.addDrawing({ ...previewStroke, points: [...currentPoints] })
      }
    }

    currentPoints = []
    previewStroke = null
    redraw()
  }

  function strokeHitTest(stroke: DrawingStroke, point: Position, radius: number): boolean {
    const checkPoints = stroke.type === 'freehand'
      ? stroke.points
      : getShapeOutlinePoints(stroke)

    for (const p of checkPoints) {
      const dx = p.x - point.x
      const dy = p.y - point.y
      if (dx * dx + dy * dy <= radius * radius) return true
    }
    return false
  }

  function getShapeOutlinePoints(stroke: DrawingStroke): Position[] {
    if (stroke.points.length < 2) return stroke.points
    const start = stroke.points[0]
    const end = stroke.points[stroke.points.length - 1]
    const pts: Position[] = []

    switch (stroke.type) {
      case 'line':
      case 'arrow':
        for (let t = 0; t <= 1; t += 0.05) {
          pts.push({ x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t })
        }
        break
      case 'rectangle': {
        const x1 = Math.min(start.x, end.x), y1 = Math.min(start.y, end.y)
        const x2 = Math.max(start.x, end.x), y2 = Math.max(start.y, end.y)
        const steps = 10
        for (let i = 0; i <= steps; i++) {
          pts.push({ x: x1 + (x2 - x1) * i / steps, y: y1 })
          pts.push({ x: x1 + (x2 - x1) * i / steps, y: y2 })
          pts.push({ x: x1, y: y1 + (y2 - y1) * i / steps })
          pts.push({ x: x2, y: y1 + (y2 - y1) * i / steps })
        }
        break
      }
      case 'circle': {
        const cx = (start.x + end.x) / 2, cy = (start.y + end.y) / 2
        const rx = Math.abs(end.x - start.x) / 2, ry = Math.abs(end.y - start.y) / 2
        for (let a = 0; a < Math.PI * 2; a += 0.2) {
          pts.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) })
        }
        break
      }
      default:
        pts.push(start, end)
    }
    return pts
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Shift') shiftKey = true
  }

  function handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'Shift') shiftKey = false
  }

  $: if ($drawings || previewStroke) redraw()

  onMount(() => {
    if (canvas) {
      ctx = canvas.getContext('2d')!
      redraw()
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  })
</script>

<svelte:window
  on:keydown={handleKeyDown}
  on:keyup={handleKeyUp}
/>

<canvas
  class="drawing-canvas"
  bind:this={canvas}
  width={$canvasWidth}
  height={$canvasHeight}
  style="width: {$canvasWidth}px; height: {$canvasHeight}px;"
  on:mousedown={handlePointerDown}
  on:mousemove={handlePointerMove}
  on:mouseup={handlePointerUp}
  on:mouseleave={handlePointerUp}
  on:touchstart={handlePointerDown}
  on:touchmove={handlePointerMove}
  on:touchend={handlePointerUp}
  class:active={$isActive}
  class:eraser={$isActive && $mode === 'eraser'}
/>

<style lang="scss">
  .drawing-canvas {
    position: absolute;
    inset: 0;
    z-index: 10;
    pointer-events: none;
    cursor: default;

    &.active {
      pointer-events: auto;
      cursor: crosshair;
    }

    &.eraser {
      cursor: none;
    }
  }
</style>
