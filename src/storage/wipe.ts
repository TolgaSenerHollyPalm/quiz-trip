import { closeDatabase, DATABASE_NAME } from './db.ts'

/** The keys this app owns; the origin may one day host another app, whose keys are none of our business. */
const OWN_KEYS = ['tripkit-destinations', 'ios-install-hint-dismissed']

/**
 * Removes everything this app keeps on the device: trips, packs, settings and — when there is a network to
 * fetch the app again — its offline copy as well. Offline the app shell is left alone, so wiping the data
 * does not leave a page that cannot even open.
 */
export async function wipeDevice({ appShell = navigator.onLine } = {}): Promise<void> {
  await closeDatabase()
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DATABASE_NAME)
    // Blocked means another tab still holds it; that tab's copy goes as soon as it lets go.
    request.onsuccess = request.onerror = request.onblocked = () => resolve()
  })

  for (const key of OWN_KEYS) {
    try {
      localStorage.removeItem(key)
    } catch {
      // Storage blocked; there was nothing we could have written either.
    }
  }

  if (!appShell) return
  const scope = import.meta.env.BASE_URL
  try {
    const names = await caches.keys()
    await Promise.all(names.filter((name) => name.includes(scope)).map((name) => caches.delete(name)))
  } catch {
    // No cache storage; nothing to clear.
  }
  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(
      registrations.filter((registration) => registration.scope.includes(scope)).map((r) => r.unregister()),
    )
  } catch {
    // No service worker; nothing to unregister.
  }
}
