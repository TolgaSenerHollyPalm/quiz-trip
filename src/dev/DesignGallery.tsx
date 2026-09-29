import { useState } from 'react'
import { href } from '../app/router.ts'
import { TRIP_KINDS } from '../trips/types.ts'
import AddField from 'kitshelf-ui/ui/AddField.tsx'
import { Button } from 'kitshelf-ui/ui/Button.tsx'
import CheckButton from 'kitshelf-ui/ui/CheckButton.tsx'
import Chip from 'kitshelf-ui/ui/Chip.tsx'
import Disclosure from 'kitshelf-ui/ui/Disclosure.tsx'
import { IconButton } from 'kitshelf-ui/ui/IconButton.tsx'
import { BackIcon, PlusIcon } from 'kitshelf-ui/ui/icons.tsx'
import { BagIcon, BoxIcon, ForkKnifeIcon, PeopleIcon, SuitcaseIcon, TrophyIcon } from '../ui/icons.tsx'
import { TRIP_KIND_LABELS } from '../ui/labels.ts'
import { ItemRow, LinkRow, ListCard } from 'kitshelf-ui/ui/ListCard.tsx'
import Menu from 'kitshelf-ui/ui/Menu.tsx'
import ProgressBar from 'kitshelf-ui/ui/ProgressBar.tsx'
import Screen from 'kitshelf-ui/ui/Screen.tsx'
import Tile from 'kitshelf-ui/ui/Tile.tsx'
import TripKindIcon from '../ui/TripKindIcon.tsx'
import { tripTheme } from '../ui/tripTheme.ts'
import styles from './DesignGallery.module.css'

const TRIP_COLOURS: Record<string, string> = {
  beach: '#1A6E9E',
  fun: '#9A6A0E',
  winter: '#47708A',
  city: '#8A5A37',
  nature: '#2F6E3B',
  business: '#4A5B78',
  other: '#0A7D76',
}

/**
 * Every building block of the design on one page, to hold next to docs/design/tripkit-theme/screens.
 * Only the development server has it (#/tasarim); the production build leaves it out.
 */
export default function DesignGallery() {
  const [pending, setPending] = useState(false)
  const [items, setItems] = useState(['Papirüs tablo'])
  const home = { screen: 'home' } as const

  return (
    <Screen
      title="Tasarım dili"
      subtitle="Uygulamanın her ekranı bu renk, yazı ve bileşenlerden kurulur."
      back={href(home)}
      aside={
        <Menu
          items={[
            { label: 'Seyahati düzenle', onSelect: () => undefined },
            { label: 'Oyun verilerini sıfırla', onSelect: () => undefined, danger: true },
            { label: 'Seyahati sil', onSelect: () => undefined, danger: true },
          ]}
        />
      }
      footer={
        <Button variant="primary" big>
          <PlusIcon size={20} strokeWidth={2.2} />
          Yeni seyahat
        </Button>
      }
    >
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Renkler</h2>
        <div className={styles.swatches}>
          {[
            ['Kâğıt', 'var(--color-bg)', '#F7F5F0'],
            ['Kart', 'var(--color-surface)', '#FFFFFF'],
            ['Çizgi', 'var(--color-border)', '#E8E2D7'],
            ['Soluk', 'var(--color-muted)', '#5E6562'],
            ['Mürekkep', 'var(--color-text)', '#1B1F1E'],
          ].map(([name, colour, hex]) => (
            <span key={name} className={styles.swatch}>
              <span className={styles.chipSample} style={{ background: colour }} />
              <strong>{name}</strong>
              {hex}
            </span>
          ))}
        </div>
        <div className={styles.pairs}>
          {[
            ['Teal · hazırlık', 'var(--color-primary)', 'var(--color-primary-soft)'],
            ['Mercan · almadan gelme', 'var(--color-coral-strong)', 'var(--color-coral-soft)'],
            ['Amber · tatmadan gelme', 'var(--color-amber-strong)', 'var(--color-amber-soft)'],
            ['Seyahat rengi · deniz', '#1A6E9E', '#DCEEF8'],
          ].map(([name, strong, soft]) => (
            <span key={name} className={styles.swatch}>
              <span className={styles.pair}>
                <span style={{ background: strong }} />
                <span style={{ background: soft }} />
              </span>
              <strong>{name}</strong>
            </span>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tatil tipine göre seyahat rengi</h2>
        <div className={styles.trips}>
          {TRIP_KINDS.map((kind) => (
            <div key={kind} className={`${styles.trip} ${tripTheme(kind)}`}>
              <Chip tone="accent" icon={<TripKindIcon kind={kind} />}>
                {TRIP_KIND_LABELS[kind]}
              </Chip>
              <div className={styles.countdown}>
                <span className={styles.days}>17</span>
                <span className={styles.left}>
                  <strong>gün kaldı</strong>
                  {kind} · {TRIP_COLOURS[kind]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tatil tipi ikonları</h2>
        <div className={styles.row}>
          {TRIP_KINDS.map((kind) => (
            <span key={kind} className={tripTheme(kind)}>
              <Tile tone="accent">
                <TripKindIcon kind={kind} size={24} />
              </Tile>
            </span>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Butonlar</h2>
        <div className={styles.row}>
          <div style={{ width: 170 }}>
            <Button variant="primary">
              <PlusIcon size={20} strokeWidth={2.2} />
              Ana eylem
            </Button>
          </div>
          <div style={{ width: 150 }}>
            <Button>İkincil eylem</Button>
          </div>
          <Button variant="text">Metin buton</Button>
          <IconButton label="Geri">
            <BackIcon />
          </IconButton>
        </div>
        <p className={styles.note}>Bir ekranda en fazla bir ana eylem olur. Silme ve sıfırlama gibi işlemler "…" menüsüne gider.</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Liste ve işaretler</h2>
        <ListCard>
          <ItemRow
            control={<CheckButton checked={pending} item="Bekleyen madde" tone="teal" onToggle={() => setPending(!pending)} />}
            text="Bekleyen madde"
            note="İsteğe bağlı not"
            strong
            done={pending}
          />
          <ItemRow control={<CheckButton checked item="Tamamlanan madde" tone="teal" onToggle={() => undefined} />} text="Tamamlanan madde" done />
        </ListCard>
        <div className={styles.row}>
          <CheckButton checked item="Hazırlık" tone="teal" onToggle={() => undefined} />
          <CheckButton checked item="Almadan gelme" tone="coral" onToggle={() => undefined} />
          <CheckButton checked item="Tatmadan gelme" tone="amber" onToggle={() => undefined} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Listeler</h2>
        <ListCard as="nav" label="Listeler">
          <LinkRow
            to={href(home)}
            tile={<Tile tone="teal"><SuitcaseIcon /></Tile>}
            title="Hazırlık listesi"
            meta="4 / 9"
            bar={<ProgressBar value={4} max={9} tone="teal" label="Hazırlık listesi" />}
          />
          <LinkRow
            to={href(home)}
            tile={<Tile tone="coral"><BagIcon /></Tile>}
            title="Almadan gelme"
            meta="2 / 6"
            bar={<ProgressBar value={2} max={6} tone="coral" label="Almadan gelme" />}
          />
          <LinkRow
            to={href(home)}
            tile={<Tile tone="amber"><ForkKnifeIcon /></Tile>}
            title="Tatmadan gelme"
            meta="1 / 7"
            bar={<ProgressBar value={1} max={7} tone="amber" label="Tatmadan gelme" />}
          />
        </ListCard>
        <ListCard as="nav" label="Oyun ayrıntıları">
          <LinkRow small to={href(home)} tile={<Tile tone="neutral" size="small"><TrophyIcon /></Tile>} title="Skor tablosu" subtitle="Deniz önde · 14 puan" />
          <LinkRow small to={href(home)} tile={<Tile tone="neutral" size="small"><PeopleIcon /></Tile>} title="Oyuncular" subtitle="Tolga, Deniz, Ada" />
          <LinkRow
            small
            to={href(home)}
            tile={<Tile tone="neutral" size="small"><BoxIcon /></Tile>}
            title="Soru paketleri"
            subtitle="Mısır — Sharm el-Şeyh"
            trailing={<span className={tripTheme('fun')}><Chip tone="accent" strong>57 gün</Chip></span>}
          />
        </ListCard>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Etiketler ve ilerleme</h2>
        <div className={styles.row}>
          <span className={tripTheme('beach')}><Chip tone="accent">Deniz</Chip></span>
          <Chip>Uçak</Chip>
          <span className={tripTheme('fun')}><Chip tone="accent" strong>57 gün</Chip></span>
          <Chip tone="quiet" strong>Bitti</Chip>
          <Chip tone="online">Çevrimiçi</Chip>
        </div>
        <div className={styles.card}>
          <div className={styles.count}>
            <span>
              <strong>4</strong>/ 9 tamam
            </span>
            <span className={styles.percent}>%44</span>
          </div>
          <ProgressBar value={4} max={9} tone="teal" label="Hazırlık listesi" thick />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Ekleme alanı</h2>
        <AddField label="Almak istediğin şey" placeholder="Ne almak istiyorsun?" tone="coral" onAdd={(text) => setItems([...items, text])} />
        <AddField label="Tatmak istediğin şey" placeholder="Ne tatmak istiyorsun?" tone="amber" onAdd={(text) => setItems([...items, text])} />
        <ListCard>
          {items.map((item) => (
            <ItemRow key={item} control={<CheckButton checked={false} item={item} tone="coral" onToggle={() => undefined} />} text={item} strong />
          ))}
          <AddField inRow label="Yeni madde" placeholder="Madde ekle, ör. fotoğraf makinesi" tone="teal" onAdd={(text) => setItems([...items, text])} />
        </ListCard>
        <Disclosure title="Tamamlananlar · 2">
          <ListCard>
            <ItemRow control={<CheckButton checked item="Kimlik / pasaport" tone="teal" onToggle={() => undefined} />} text="Kimlik / pasaport" done />
            <ItemRow control={<CheckButton checked item="Mayo / bikini" tone="teal" onToggle={() => undefined} />} text="Mayo / bikini" done />
          </ListCard>
        </Disclosure>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Yazı</h2>
        <div className={styles.type}>
          <span className={styles.pageTitle}>Sayfa başlığı</span>
          <span className={styles.sectionTitle}>Bölüm başlığı</span>
          <span className={styles.body}>Liste maddesi ve gövde</span>
          <span className={styles.note}>Not ve açıklama</span>
        </div>
      </section>
    </Screen>
  )
}
