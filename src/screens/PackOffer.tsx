import { Button } from 'kitshelf-ui/ui/Button.tsx'
import { LinkRow, ListCard } from 'kitshelf-ui/ui/ListCard.tsx'
import text from 'kitshelf-ui/ui/text.module.css'
import Tile from 'kitshelf-ui/ui/Tile.tsx'
import { useOnline } from 'kitshelf-ui/ui/useOnline.ts'
import { useEffect, useState, type ReactNode } from 'react'
import { useAppData } from '../app/appData.ts'
import { href, navigate } from '../app/router.ts'
import type { TripState } from '../game/types.ts'
import { bundledPacks } from '../packs/bundled.ts'
import { fetchPackList, type IndexEntry } from '../packs/sync.ts'
import { findCountry } from '../trips/destinations.ts'
import { defaultPacks, matchesDestination, shortPackTitle } from '../trips/packMatch.ts'
import { BoxIcon, CloudIcon } from '../ui/icons.tsx'
import styles from './PackOffer.module.css'

interface Known {
  id: string
  title: string
  questionCount?: number
}

/** A trip without packs (plan 10): the pack its destination has, or why there is none yet. */
export default function PackOffer({ trip }: { trip: TripState }) {
  const { packs, destinations, addPacks, arriving } = useAppData()
  const online = useOnline()
  const [listed, setListed] = useState<IndexEntry[] | 'failed'>()
  const [failed, setFailed] = useState<string>()
  const { country, cityId } = trip

  // Read once; offline, what the phone and the app carry is enough.
  useEffect(() => {
    if (!online || country === undefined || listed !== undefined) return undefined
    let active = true
    fetchPackList({
      fetch: (url, init) => fetch(url, init),
      store: { versions: () => Promise.resolve(new Map()), saveIfNewer: () => Promise.resolve(false) },
      baseUrl: import.meta.env.BASE_URL,
      wanted: (pin) => matchesDestination(pin, { country, cityId }),
    })
      .then((result) => {
        if (active) setListed(result.ok ? result.entries : 'failed')
      })
      .catch(() => {
        if (active) setListed('failed')
      })
    return () => {
      active = false
    }
  }, [online, country, cityId, listed])

  const known = new Map<string, Known & { country?: string; cityId?: string }>()
  for (const pack of [...packs, ...bundledPacks()]) {
    if (!known.has(pack.id)) known.set(pack.id, { ...pack, questionCount: pack.questions.length })
  }
  for (const entry of Array.isArray(listed) ? listed : []) if (!known.has(entry.id)) known.set(entry.id, entry)
  const pins = country === undefined ? [] : [...known.values()].filter((pin) => matchesDestination(pin, { country, cityId }))
  const defaults = country === undefined ? [] : defaultPacks({ country, cityId }, pins)
  const countryEntry = findCountry(destinations, country)
  const place = countryEntry?.cities.find((city) => city.id === cityId)?.name ?? countryEntry?.name ?? ''

  // The games open in this card's place; the card only hears back when the pack did not come.
  const add = async (packId: string) => {
    setFailed(undefined)
    setFailed(await addPacks(trip.id, [packId]))
  }

  let top: ReactNode
  if (arriving.includes(trip.id)) {
    top = <p className={`${styles.top} ${text.hint}`}>Paket iniyor…</p>
  } else if (defaults.length === 1) {
    const pack = known.get(defaults[0])
    const count = pack?.questionCount
    top = (
      <Offer
        tile={<Tile tone="teal"><BoxIcon size={20} /></Tile>}
        title={`${shortPackTitle(pack?.title ?? '', countryEntry?.name)} paketi hazır`}
        subtitle={`${count !== undefined ? `${count} soru · ` : ''}bilgi yarışması ve tahminler açılır`}
        action={
          <Button variant="primary" onClick={() => void add(defaults[0])}>
            Paketi ekle
          </Button>
        }
        problem={failed}
      />
    )
  } else if (pins.length > 0) {
    top = (
      <Offer
        tile={<Tile tone="teal"><BoxIcon size={20} /></Tile>}
        title={`${place} için ${pins.length} paket var`}
        subtitle="Gideceğin yerin paketini seç; bilgi yarışması ve tahminler açılır."
        action={
          <Button variant="primary" onClick={() => navigate({ screen: 'trip-packs', tripId: trip.id })}>
            Paketleri gör
          </Button>
        }
      />
    )
  } else if (trip.packOffer === 'waiting' && (!online || listed === 'failed')) {
    top = (
      <Offer
        tile={<Tile tone="neutral"><CloudIcon /></Tile>}
        title="İnternet gelince iner"
        subtitle="Bu seyahatin soru paketi varsa internete bağlanınca kendiliğinden eklenir."
      />
    )
  } else if (Array.isArray(listed)) {
    top = (
      <Offer
        tile={<Tile tone="neutral"><BoxIcon size={20} /></Tile>}
        title="Bu yer için henüz paket yok"
        subtitle="Başka bir paketi Soru paketleri’nden ekleyebilirsin."
      />
    )
  } else if (online && country !== undefined && listed === undefined) {
    top = <p className={`${styles.top} ${text.hint}`}>Paketler aranıyor…</p>
  } else {
    top = (
      <p className={`${styles.top} ${text.hint}`}>
        Bu seyahate soru paketi bağlı değil. Paket eklersen bilgi yarışması ve tahminler açılır.
      </p>
    )
  }

  return (
    <div className={styles.frame}>
      <ListCard as="div">
        {top}
        <LinkRow
          small
          to={href({ screen: 'trip-packs', tripId: trip.id })}
          tile={<Tile tone="neutral" size="small"><BoxIcon /></Tile>}
          title="Soru paketleri"
        />
      </ListCard>
    </div>
  )
}

function Offer({ tile, title, subtitle, action, problem }: { tile: ReactNode; title: string; subtitle: string; action?: ReactNode; problem?: string }) {
  return (
    <div className={`${styles.top} ${action ? styles.withAction : ''}`}>
      <div className={styles.row}>
        {tile}
        <span className={styles.words}>
          <span className={styles.title}>{title}</span>
          <span className={styles.subtitle}>{subtitle}</span>
        </span>
      </div>
      {action && <div className={styles.action}>{action}</div>}
      {problem && (
        <p className={`${text.problem} ${styles.problem}`} role="alert">
          {problem}
        </p>
      )}
    </div>
  )
}
