/**
 * QR scan spot (`?spot=venue-a`)
 *
 * The spot only says which QR code was scanned — it's for attribution and
 * preselecting a location, not proof of where someone is.
 */

const SPOT_PATTERN = /^[a-z0-9-]{1,40}$/

/** Returns a clean slug, or null for missing/garbage values. */
export function normalizeSpot(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  const spot = raw?.trim().toLowerCase()
  return spot && SPOT_PATTERN.test(spot) ? spot : null
}
