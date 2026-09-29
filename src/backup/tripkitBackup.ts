import type { BackupAdapter, CountLine } from 'kitshelf-ui/backup/format.ts'
import { backupDue } from 'kitshelf-ui/backup/reminder.ts'
import { readBackupState, snoozeReminder, type BackupState } from 'kitshelf-ui/backup/state.ts'
import { useCallback, useMemo, useState } from 'react'
import { useAppData } from '../app/appData.ts'
import type { TripState } from '../game/types.ts'
import { validatePack } from '../packs/validate.ts'
import { DATABASE_VERSION, restoreBackup } from '../storage/db.ts'
import type { TripkitData } from './restorePlan.ts'

export const KIT = 'tripkit'
export const KIT_NAME = 'TripKit'

/** TripKit's own words in the shared backup parts. */
export const BACKUP_TEXTS = {
  card: 'Seyahatlerin yalnızca bu cihazda duruyor. Yedek dosyasını Drive’a, e-postana ya da kendine gönder; telefon değişirse buradan geri yüklersin.',
  merge: 'Bu cihazda olmayan seyahatler eklenir. İkisinde de olan seyahatin daha yeni hâli kalır. Hiçbir şey silinmez.',
  replace: 'Bu cihazdaki seyahatler ve paketler silinir, yerine yedektekiler gelir.',
  banner: 'Telefonun değişirse seyahatlerin kaybolmasın.',
}

export function replaceWarning(localTrips: number, localPacks: number, backupTrips: number) {
  return {
    title: 'Bu cihazdaki seyahatler silinsin mi?',
    text: `Bu cihazdaki ${localTrips} seyahat ve ${localPacks} soru paketi silinecek, yerine yedekteki ${backupTrips} seyahat gelecek. Geri alınamaz.`,
  }
}

export const stampTrip = (trip: TripState, now: Date): TripState => ({ ...trip, updatedAt: now.toISOString() })

type Json = Record<string, unknown>
const isRecord = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value)
const isString = (value: unknown): value is string => typeof value === 'string'
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const optional = (value: unknown, check: (value: unknown) => boolean) => value === undefined || check(value)
const listOf = (value: unknown, check: (value: unknown) => boolean) => Array.isArray(value) && value.every(check)
const unique = (ids: string[]) => new Set(ids).size === ids.length

const isChecklistItem = (v: unknown) =>
  isRecord(v) && isString(v.id) && isString(v.text) && (v.group === 'pack' || v.group === 'do') && optional(v.source, isString) && typeof v.done === 'boolean'
const isNoteItem = (v: unknown) =>
  isRecord(v) && isString(v.id) && isString(v.text) && optional(v.note, isString) && typeof v.done === 'boolean'
const isPlayer = (v: unknown) => isRecord(v) && isString(v.id) && isString(v.nickname)
const isRound = (v: unknown) =>
  isRecord(v) && isString(v.id) && isString(v.playedAt) && isRecord(v.scores) && Object.values(v.scores).every(isNumber)
const isPrediction = (v: unknown) =>
  isRecord(v) && isString(v.id) && isString(v.text) && (v.type === 'number' || v.type === 'choice') && isString(v.status) && isRecord(v.guesses)
const isCurrentRound = (v: unknown) => isRecord(v) && isString(v.id) && isRecord(v.settings) && Array.isArray(v.turns) && Array.isArray(v.answers)

/** The shape a stored trip has had since version 4; older records reach it through the migrations first. */
export function isTrip(v: unknown): v is TripState {
  return (
    isRecord(v) &&
    isString(v.id) &&
    v.id !== '' &&
    isString(v.name) &&
    listOf(v.packIds, isString) &&
    ['country', 'cityId', 'startDate', 'endDate', 'transport', 'kind', 'updatedAt'].every((key) => optional(v[key], isString)) &&
    listOf(v.checklist, isChecklistItem) &&
    listOf(v.souvenirs, isNoteItem) &&
    listOf(v.tastes, isNoteItem) &&
    listOf(v.players, isPlayer) &&
    isRecord(v.params) &&
    Object.values(v.params).every(isNumber) &&
    listOf(v.askedQuestionIds, isString) &&
    listOf(v.rounds, isRound) &&
    listOf(v.predictions, isPrediction) &&
    optional(v.quizSettings, isRecord) &&
    optional(v.currentRound, isCurrentRound)
  )
}

/** Structure only: one bad trip or pack, or an id used twice, and the whole file is refused. */
export function validateTripkitData(data: unknown): data is TripkitData {
  if (!isRecord(data) || !Array.isArray(data.trips) || !Array.isArray(data.packs)) return false
  if (!data.trips.every(isTrip) || !data.packs.every((pack) => validatePack(pack).ok)) return false
  return unique(data.trips.map((trip) => trip.id)) && unique(data.packs.map((pack) => (pack as { id: string }).id))
}

export function summarizeTripkit(data: TripkitData): CountLine[] {
  const items = data.trips.reduce((total, trip) => total + trip.checklist.length + trip.souvenirs.length + trip.tastes.length, 0)
  return [
    { key: 'trips', count: data.trips.length, label: 'seyahat' },
    { key: 'packs', count: data.packs.length, label: 'soru paketi' },
    { key: 'listItems', count: items, label: 'liste maddesi' },
  ]
}

/** Backups began with data version 4; a later version adds its step here, as db.ts does for stored trips. */
export function migrateTripkit(data: unknown, from: number): unknown {
  if (from === DATABASE_VERSION) return data
  throw new Error(`No backup migration from data version ${from}`)
}

export function latestChange(trips: readonly TripState[]): string | undefined {
  return trips.reduce<string | undefined>((latest, trip) => (trip.updatedAt && (!latest || trip.updatedAt > latest) ? trip.updatedAt : latest), undefined)
}

/** The adapter reads what is in memory, so the share sheet can open right after the tap. */
export function useTripkitBackup(): BackupAdapter<TripkitData> {
  const { trips, packs, reload } = useAppData()
  return useMemo(
    () => ({
      kit: KIT,
      kitName: KIT_NAME,
      dataVersion: DATABASE_VERSION,
      appBuild: __BUILD_TIME__,
      exportData: () => ({ trips, packs }),
      summarize: summarizeTripkit,
      migrate: migrateTripkit,
      validate: validateTripkitData,
      async restore(data, mode) {
        const counts = await restoreBackup(data, mode)
        await reload()
        return counts
      },
      lastChangeAt: () => latestChange(trips),
      hasUserData: () => trips.length > 0,
    }),
    [trips, packs, reload],
  )
}

function reminderOf(state: BackupState, trips: readonly TripState[]) {
  return backupDue({ now: new Date(), hasUserData: trips.length > 0, lastChangeAt: latestChange(trips), ...state })
}

/** Whether a backup is due, for the home screen's banner and dot and for the settings card. */
export function useBackupReminder() {
  const { trips } = useAppData()
  const [state, setState] = useState(() => readBackupState(KIT))
  const refresh = useCallback(() => setState(readBackupState(KIT)), [])
  const snooze = useCallback(() => {
    snoozeReminder(KIT, new Date())
    setState(readBackupState(KIT))
  }, [])
  return { reminder: reminderOf(state, trips), lastBackupAt: state.lastBackupAt, refresh, snooze }
}
