import { wipeDevice as wipe } from 'kitshelf-ui/storage/wipe.ts'
import { closeDatabase, DATABASE_NAME } from './db.ts'

/** The keys this app owns; the origin may one day host another app, whose keys are none of our business. */
export const OWN_KEYS = ['tripkit-destinations', 'ios-install-hint-dismissed', 'tripkit-appearance', 'offline-ready-shown']

/** Removes trips, packs and settings, and — when there is a network to fetch the app again — its offline copy. */
export function wipeDevice({ appShell = navigator.onLine } = {}): Promise<void> {
  return wipe({
    databaseNames: [DATABASE_NAME],
    ownKeys: OWN_KEYS,
    beforeDelete: closeDatabase,
    appShell,
    scope: import.meta.env.BASE_URL,
  })
}
