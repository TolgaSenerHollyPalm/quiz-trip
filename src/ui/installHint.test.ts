import { describe, expect, it } from 'vitest'
import { showsIosInstallHint } from './installHint.ts'

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1'
const IPHONE_CHROME =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 CriOS/140.0.0.0 Mobile/15E148 Safari/604.1'
const IPHONE_FIREFOX =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 FxiOS/140.0 Mobile/15E148 Safari/605.1.15'
const IPAD = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15'
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36'

describe('showsIosInstallHint', () => {
  it('shows on an iPhone that is still in the browser', () => {
    expect(showsIosInstallHint(IPHONE, 5, false)).toBe(true)
  })

  it('shows whichever browser the iPhone uses', () => {
    expect(showsIosInstallHint(IPHONE_CHROME, 5, false)).toBe(true)
    expect(showsIosInstallHint(IPHONE_FIREFOX, 5, false)).toBe(true)
  })

  it('shows on an iPad, which calls itself a Mac but has a touch screen', () => {
    expect(showsIosInstallHint(IPAD, 5, false)).toBe(true)
  })

  it('stays away once the app runs from the home screen', () => {
    expect(showsIosInstallHint(IPHONE, 5, true)).toBe(false)
  })

  it('stays away on a Mac and on Android, where Chrome offers the install itself', () => {
    expect(showsIosInstallHint(IPAD, 0, false)).toBe(false)
    expect(showsIosInstallHint(ANDROID, 5, false)).toBe(false)
  })
})
