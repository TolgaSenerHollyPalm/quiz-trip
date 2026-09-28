/** The app's colours: the phone's own light or dark setting, or always one of them. */
export type Appearance = 'system' | 'light' | 'dark'

// The inline script in index.html reads the same key and colours before the first paint.
const APPEARANCE_KEY = 'tripkit-appearance'
const THEME_COLORS = { light: '#f7f5f0', dark: '#111615' } as const
const SYSTEM_DARK = '(prefers-color-scheme: dark)'

let current: Appearance = 'system'

export function parseAppearance(stored: string | null): Appearance {
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

export function resolveScheme(appearance: Appearance, systemDark: boolean): 'light' | 'dark' {
  if (appearance !== 'system') return appearance
  return systemDark ? 'dark' : 'light'
}

export function currentAppearance(): Appearance {
  return current
}

function apply(appearance: Appearance) {
  current = appearance
  const scheme = resolveScheme(appearance, matchMedia(SYSTEM_DARK).matches)
  document.documentElement.dataset.scheme = scheme
  // Each theme-color tag answers to its own media query, so a fixed choice has to overwrite both.
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = THEME_COLORS[appearance === 'system' ? (meta.media.includes('dark') ? 'dark' : 'light') : scheme]
  }
}

export function saveAppearance(appearance: Appearance) {
  try {
    if (appearance === 'system') localStorage.removeItem(APPEARANCE_KEY)
    else localStorage.setItem(APPEARANCE_KEY, appearance)
  } catch {
    // Storage blocked: the choice still holds until the app is closed.
  }
  apply(appearance)
}

/** Applies the saved choice and, while the phone decides, follows the phone when its setting changes. */
export function watchAppearance() {
  let stored = null
  try {
    stored = localStorage.getItem(APPEARANCE_KEY)
  } catch {
    // Storage blocked: follow the phone.
  }
  apply(parseAppearance(stored))
  matchMedia(SYSTEM_DARK).addEventListener('change', () => apply(current))
}
