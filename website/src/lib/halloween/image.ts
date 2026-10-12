/**
 * Halloween photo prep (browser only)
 *
 * Downscales the photo to a JPEG for a fast upload on venue wifi,
 * and pulls a 5-color palette from its pixels (like the app's swatch row).
 */

const MAX_EDGE = 1600
const JPEG_QUALITY = 0.86

export interface PreparedPhoto {
  blob: Blob
  previewUrl: string
  width: number
  height: number
  swatches: string[]
}

type Rgb = [number, number, number]

const rgbToHex = (c: Rgb) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const lum = (c: Rgb) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
const dist = (a: Rgb, b: Rgb) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

/** Choose 5 well-separated colors, ordered dark → light. */
function pickFive(colors: Rgb[]): string[] {
  const chosen: Rgb[] = []
  for (const c of colors) {
    if (chosen.every((k) => dist(k, c) > 38)) chosen.push(c)
    if (chosen.length === 5) break
  }
  while (chosen.length < 5) {
    const base = chosen[chosen.length - 1] || [236, 231, 223]
    chosen.push(base.map((v) => v + (255 - v) * 0.45) as Rgb)
  }
  return chosen.sort((a, b) => lum(a) - lum(b)).map(rgbToHex)
}

/** Bucket colors from real pixels and take the most common distinct ones. */
function paletteFromCanvas(ctx: CanvasRenderingContext2D, w: number, h: number): string[] {
  const { data } = ctx.getImageData(0, 0, w, h)
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>()
  const step = Math.max(1, Math.floor((w * h) / 6000)) * 4
  for (let i = 0; i < data.length; i += step) {
    const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4)
    const b = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 }
    b.n++
    b.r += data[i]
    b.g += data[i + 1]
    b.b += data[i + 2]
    buckets.set(key, b)
  }
  const ranked = [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .map((b): Rgb => [b.r / b.n, b.g / b.n, b.b / b.n])
  return pickFive(ranked)
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image'))
    }
    img.src = url
  })
}

const isHeic = (file: File) => /hei[cf]$/i.test(file.type) || /\.hei[cf]$/i.test(file.name)

/**
 * Safari decodes HEIC natively; other browsers need heic2any.
 * Try the browser first and only load the converter if that fails.
 */
async function decode(file: File): Promise<HTMLImageElement> {
  try {
    return await loadImage(file)
  } catch (err) {
    if (!isHeic(file)) throw err
    const heic2any = (await import('heic2any')).default
    const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
    return loadImage(Array.isArray(converted) ? converted[0] : converted)
  }
}

export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  const img = await decode(file)
  const k = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight))
  const width = Math.round(img.naturalWidth * k)
  const height = Math.round(img.naturalHeight * k)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  ctx.drawImage(img, 0, 0, width, height)

  const swatches = paletteFromCanvas(ctx, width, height)
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode image'))), 'image/jpeg', JPEG_QUALITY)
  )

  return { blob, previewUrl: URL.createObjectURL(blob), width, height, swatches }
}
