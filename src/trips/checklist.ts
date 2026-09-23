import type { TripState } from '../game/types.ts'
import type { ChecklistItem, Transport, TripKind } from './types.ts'

/** A suggestion is a checklist item before it is put on a trip's list. */
type Suggestion = Pick<ChecklistItem, 'id' | 'text' | 'group'>

const pack = (id: string, text: string): Suggestion => ({ id, text, group: 'pack' })
const todo = (id: string, text: string): Suggestion => ({ id, text, group: 'do' })

/** Whatever the trip is, these are the ones people kick themselves for forgetting. */
const COMMON: Suggestion[] = [
  pack('common-id', 'Kimlik / pasaport'),
  pack('common-charger', 'Telefon şarj aleti ve kablosu'),
  pack('common-powerbank', 'Powerbank'),
  pack('common-meds', 'İlaçlar ve küçük ilk yardım seti'),
  pack('common-toiletries', 'Diş fırçası ve hijyen çantası'),
  todo('common-offline-docs', 'Bilet ve rezervasyonları telefona indir'),
  todo('common-charge', 'Telefonu ve powerbank’ı tam şarj et'),
  todo('common-home', 'Çıkmadan önce fişleri çek, suyu kapat'),
]

const BY_TRANSPORT: Partial<Record<Transport, Suggestion[]>> = {
  plane: [
    pack('plane-passport', 'Pasaport (en az 6 ay geçerli olsun)'),
    pack('plane-liquids', 'Sıvıları 100 ml’lik kaplara ayır'),
    pack('plane-headphones', 'Kulaklık ve boyun yastığı'),
    todo('plane-checkin', 'Online check-in yap, kartı telefona kaydet'),
    todo('plane-baggage', 'Bagaj hakkını ve kabin çantası ölçülerini kontrol et'),
    todo('plane-airport', 'Havaalanında uçuştan 2 saat önce ol'),
  ],
  car: [
    pack('car-licence', 'Ehliyet ve ruhsat'),
    pack('car-holder', 'Telefon tutucu ve araç şarjı'),
    pack('car-snacks', 'Yol için su ve atıştırmalık'),
    todo('car-tyres', 'Lastik havası, yağ ve su seviyesini kontrol et'),
    todo('car-toll', 'HGS/OGS bakiyesini yükle'),
    todo('car-route', 'Rotayı çevrimdışı haritaya indir'),
    todo('car-fuel', 'Depoyu çıkmadan doldur'),
  ],
  bus: [
    pack('bus-pillow', 'Boyun yastığı ve ince bir örtü'),
    pack('bus-headphones', 'Kulaklık'),
    pack('bus-snacks', 'Su ve atıştırmalık'),
    todo('bus-terminal', 'Biletteki kalkış terminalini ve saatini doğrula'),
    todo('bus-early', 'Terminalde kalkıştan 30 dakika önce ol'),
  ],
  ferry: [
    pack('ferry-jacket', 'Rüzgara karşı ince bir mont'),
    pack('ferry-pills', 'Deniz tutması ilacı'),
    pack('ferry-sunglasses', 'Güneş gözlüğü'),
    todo('ferry-schedule', 'Sefer saatini ve hava durumuna göre iptalleri kontrol et'),
    todo('ferry-port', 'Limana kalkıştan 45 dakika önce var'),
  ],
}

const BY_KIND: Partial<Record<TripKind, Suggestion[]>> = {
  beach: [
    pack('beach-swimsuit', 'Mayo / bikini'),
    pack('beach-towel', 'Plaj havlusu'),
    pack('beach-sunscreen', 'Yüksek faktörlü güneş kremi'),
    pack('beach-slippers', 'Terlik'),
    pack('beach-hat', 'Şapka ve güneş gözlüğü'),
    todo('beach-towel-check', 'Kaldığın yerde havlu veriliyor mu, öğren'),
  ],
  hotel: [
    pack('hotel-booking', 'Otel rezervasyonunun çevrimdışı kopyası'),
    pack('hotel-swimsuit', 'Mayo (havuz ve spa için)'),
    pack('hotel-slippers', 'Terlik'),
    pack('hotel-outfit', 'Akşam yemeği için şık bir kıyafet'),
    todo('hotel-times', 'Giriş ve çıkış saatlerini not et'),
    todo('hotel-board', 'Kahvaltı/yemek dahil mi, kontrol et'),
    todo('hotel-activities', 'Otelin aktivite ve servis saatlerine bak'),
  ],
  winter: [
    pack('winter-thermal', 'Termal içlik'),
    pack('winter-boots', 'Su geçirmez bot'),
    pack('winter-gloves', 'Eldiven, bere, boyunluk'),
    pack('winter-socks', 'Kalın çorap'),
    pack('winter-cream', 'Nemlendirici ve dudak kremi'),
    pack('winter-goggles', 'Kar gözlüğü ve güneş kremi'),
    todo('winter-weather', 'Hava ve yol durumunu çıkmadan kontrol et'),
    todo('winter-gear', 'Kayak ekipmanı kiralamayı ayarla'),
  ],
  city: [
    pack('city-shoes', 'Rahat yürüyüş ayakkabısı'),
    pack('city-daypack', 'Küçük sırt çantası'),
    pack('city-rain', 'Yağmurluk ya da katlanır şemsiye'),
    todo('city-tickets', 'Müze ve tur biletlerini önceden al'),
    todo('city-transit', 'Toplu taşıma kartı/uygulamasına bak'),
    todo('city-map', 'Gezilecek yerleri haritada işaretle'),
  ],
  nature: [
    pack('nature-shoes', 'Trekking ayakkabısı'),
    pack('nature-rain', 'Yağmurluk'),
    pack('nature-repellent', 'Sinek kovucu'),
    pack('nature-torch', 'Fener ve yedek pil'),
    pack('nature-thermos', 'Termos ve su'),
    todo('nature-route', 'Rotayı ve hava durumunu kontrol et'),
    todo('nature-tell', 'Nereye gittiğini yakınına söyle'),
    todo('nature-offline-map', 'Çevrimdışı harita indir'),
  ],
  business: [
    pack('business-docs', 'Evraklar ve sunum dosyası'),
    pack('business-cards', 'Kartvizit'),
    pack('business-laptop', 'Dizüstü ve şarj aleti'),
    pack('business-outfit', 'Ütülü kıyafet / takım'),
    todo('business-calendar', 'Toplantı saatlerini takvime ekle'),
    todo('business-backup', 'Sunumu yedekle (bulut + USB)'),
    todo('business-receipts', 'Masraf fişlerini toplamak için bir zarf ayır'),
  ],
}

type TripChoices = Pick<TripState, 'checklist' | 'transport' | 'kind'>

/** The suggestion lists that apply to this trip, in the order they are added: common, vehicle, holiday. */
function activeLists(trip: Pick<TripChoices, 'transport' | 'kind'>): [string, Suggestion[]][] {
  const lists: [string, Suggestion[]][] = [['common', COMMON]]
  const transport = trip.transport && BY_TRANSPORT[trip.transport]
  if (trip.transport && transport) lists.push([trip.transport, transport])
  const kind = trip.kind && BY_KIND[trip.kind]
  if (trip.kind && kind) lists.push([trip.kind, kind])
  return lists
}

/**
 * Brings the checklist in line with the trip's vehicle and holiday type: items the player wrote and
 * anything already ticked off stay, suggestions from choices that no longer apply drop out, and the
 * new choices' missing items are added.
 */
export function applySuggestions(trip: TripChoices): ChecklistItem[] {
  const lists = activeLists(trip)
  const active = new Set(lists.map(([source]) => source))
  const kept = trip.checklist.filter((item) => item.source === undefined || item.done || active.has(item.source))
  const known = new Set(kept.map((item) => item.id))
  const added = lists.flatMap(([source, list]) =>
    list.filter((suggestion) => !known.has(suggestion.id)).map((suggestion) => ({ ...suggestion, source, done: false })),
  )
  return [...kept, ...added]
}
