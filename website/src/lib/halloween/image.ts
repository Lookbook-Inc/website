/**
 * Halloween photo prep (browser only)
 *
 * Downscales the photo to a JPEG for a fast upload on venue wifi.
 */

const MAX_EDGE = 1600
const JPEG_QUALITY = 0.86

export interface PreparedPhoto {
  blob: Blob
  previewUrl: string
  width: number
  height: number
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

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode image'))), 'image/jpeg', JPEG_QUALITY)
  )

  return { blob, previewUrl: URL.createObjectURL(blob), width, height }
}
