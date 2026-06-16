export async function generateThumbnail(
  canvasElement: HTMLElement | null,
  width: number = 200,
  height: number = 250
): Promise<string | null> {
  if (!canvasElement) return null

  try {
    const html2canvas = (await import('html2canvas')).default

    const canvas = await html2canvas(canvasElement, {
      backgroundColor: null,
      scale: 1,
      useCORS: true,
      logging: false,
    })

    const targetCanvas = document.createElement('canvas')
    targetCanvas.width = width
    targetCanvas.height = height
    const ctx = targetCanvas.getContext('2d')

    if (!ctx) return null

    const srcRatio = canvas.width / canvas.height
    const targetRatio = width / height

    let sx = 0
    let sy = 0
    let sw = canvas.width
    let sh = canvas.height

    if (srcRatio > targetRatio) {
      sw = canvas.height * targetRatio
      sx = (canvas.width - sw) / 2
    } else {
      sh = canvas.width / targetRatio
      sy = (canvas.height - sh) / 2
    }

    ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, width, height)

    return targetCanvas.toDataURL('image/jpeg', 0.8)
  } catch (error) {
    console.error('Failed to generate thumbnail:', error)
    return null
  }
}
