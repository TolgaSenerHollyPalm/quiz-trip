/**
 * No browser on an iPhone or iPad offers to install a web app, so the app has to point at the browser's own
 * "Share → Add to Home Screen". Every iOS browser reports itself as iPhone/iPad, so this covers all of them.
 * Android needs no hint: Chrome offers the install itself.
 */
export function showsIosInstallHint(userAgent: string, touchPoints: number, standalone: boolean): boolean {
  // An iPad reports itself as a Mac, so a touch screen is what tells them apart.
  const ios = /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && touchPoints > 1)
  return ios && !standalone
}

/** Whether the page is already running as an installed app rather than inside the browser. */
export function isStandalone(): boolean {
  const legacy = (navigator as { standalone?: boolean }).standalone === true // iOS before display-mode
  return legacy || window.matchMedia('(display-mode: standalone)').matches
}
