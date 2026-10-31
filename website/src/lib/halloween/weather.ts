/**
 * The current weather in San Francisco, for the page header. Server only.
 *
 * Comes from the National Weather Service, which needs no key. It must never hold up the
 * page or break it: a slow or failed call just means the header shows the date alone.
 */

const OBSERVATION_URL = 'https://api.weather.gov/stations/KSFO/observations/latest'
const TIMEOUT_MS = 800
const CACHE_MS = 10 * 60_000
const FAILURE_CACHE_MS = 60_000
const MAX_AGE_MS = 3 * 60 * 60_000

export interface Weather {
  tempF: number
  /** A word or two, like "Clear" or "Mostly Cloudy". */
  summary: string
}

let cached: { weather: Weather | null; expires: number } | null = null

async function fetchWeather(): Promise<Weather | null> {
  const res = await fetch(OBSERVATION_URL, {
    cache: 'no-store',
    headers: { 'User-Agent': 'lookbook.inc halloween page' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) return null
  const { properties } = await res.json()
  const celsius = properties?.temperature?.value
  if (typeof celsius !== 'number') return null
  if (Date.now() - Date.parse(properties.timestamp) > MAX_AGE_MS) return null
  const summary = String(properties.textDescription ?? '').split(/\s+and\s+|\//)[0].trim()
  return { tempF: Math.round((celsius * 9) / 5 + 32), summary }
}

export async function getWeather(): Promise<Weather | null> {
  if (cached && cached.expires > Date.now()) return cached.weather
  const weather = await fetchWeather().catch(() => null)
  cached = { weather, expires: Date.now() + (weather ? CACHE_MS : FAILURE_CACHE_MS) }
  return weather
}
