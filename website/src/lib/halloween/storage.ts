/**
 * Per-device memory for the Halloween page.
 *
 * Delete tokens live only in the poster's browser: clearing site data
 * means they can no longer delete that photo themselves.
 */

const TOKENS_KEY = 'halloween:mine'
const NAME_KEY = 'halloween:name'
const OPENER_KEY = 'halloween:opener-seen'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private mode / storage full: the page still works, just without memory.
  }
}

export const loadDeleteTokens = () => read<Record<string, string>>(TOKENS_KEY, {})
export const saveDeleteTokens = (tokens: Record<string, string>) => write(TOKENS_KEY, tokens)

export const loadName = () => read<string>(NAME_KEY, '')
export const saveName = (name: string) => write(NAME_KEY, name)

/* The opening board plays once per tab, so a reload (or iOS reloading after the camera) goes straight to the feed. */
export function hasSeenOpener() {
  try {
    return sessionStorage.getItem(OPENER_KEY) === '1'
  } catch {
    return false
  }
}

export function markOpenerSeen() {
  try {
    sessionStorage.setItem(OPENER_KEY, '1')
  } catch {
    // Private mode: the board just plays again next load.
  }
}
