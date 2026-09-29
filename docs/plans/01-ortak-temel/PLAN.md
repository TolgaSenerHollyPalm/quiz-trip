# KitShelf 1. adım — Ortak temel ve yedekleme

Bu dosya Claude Code için çalışma talimatıdır. Önce tamamını oku, sonra tasarım görüntülerine bak (bölüm 2), **Aşama A**'dan başla. Her aşamanın sonunda dur, kısa özet ver, Tolga'nın onayını bekle.

## 0. Amaç

KitShelf'e yeni kitler geliyor (BookKit, FreedomKit, FreeTimeKit). Hepsi TripKit gibi ücretsiz, hesapsız, çevrimdışı ve verisi cihazda kalan PWA'lar olacak. Bu adımda:

1. TripKit'in tema ve bileşenleri **`kitshelf-ui`** adında ayrı bir depoya çıkarılır; TripKit onu kullanır, görünümü değişmez.
2. **Yedekleme** (dışa aktar / içe aktar, kalıcı depolama durumu, hatırlatma) `kitshelf-ui`'ye yazılır ve TripKit'e eklenir.
3. Yeni kitlerin başlayacağı **`kit-template`** deposu hazırlanır.

Kitler ayrı depolarda kalır, çünkü GitHub Pages bir depodan tek site yayınlar.

## 1. Mevcut durum

| Ne | Nerede |
| --- | --- |
| TripKit deposu | `~/MyProjects/quiz-trip` → GitHub `TolgaSenerHollyPalm/quiz-trip`, canlı adres `https://trip.kitshelf.app` |
| Yeni depolar (bu adımda) | `~/MyProjects/kitshelf-ui`, `~/MyProjects/kit-template` → GitHub `TolgaSenerHollyPalm/kitshelf-ui`, `TolgaSenerHollyPalm/kit-template` (herkese açık) |
| Yığın | Vite 8, React 19, TypeScript 6, vite-plugin-pwa, `idb`, Vitest, oxlint, Node 26 |
| Veri | IndexedDB `quiz-trip` sürüm 4, depolar `packs` ve `trips` (`src/storage/db.ts`, migration'lar `src/storage/migrations.ts`) |
| Ayarlar ekranı | `src/screens/AppSettingsScreen.tsx`; silme `src/storage/wipe.ts` (`OWN_KEYS`) |
| Kalıcı depolama | `requestPersistentStorage()` zaten var ve `AppDataProvider` açılışta çağırıyor; durumu hiçbir yerde gösterilmiyor |
| Yayın | `main`'e her push `.github/workflows/deploy.yml` ile test + build + GitHub Pages. **`main`'e push = canlıya çıkış.** |
| Tema | `docs/design/tripkit-theme/THEME.md`, tokenlar `src/index.css`, yazı tipleri `src/fonts.css` |

`src/ui/` altındaki bileşenlerden `Button`, `IconButton`, `ListCard`, `Screen`, `Missing` şu an `../app/router.ts`'teki `Route` tipine bağlı. Paylaşılan pakette bu bağ olmamalı (Aşama A).

## 2. Tasarım

Yeni ekranlar `docs/design/tripkit-theme/` altında, mevcut 01–08'in devamı olarak duruyor (dosyalar depoya kondu). `html/` ölçü ve renklerin kaynağı; satır içi stilleri kopyalama, tokenlara ve CSS Modules'a çevir. Çelişkide öncelik: **bu dosya > `THEME.md` > `html/`**.

Maketlerde token olmayan iki renk var: seçili seçenek açıklamasındaki `#3F4542` yerine `--color-chip-text`, alt pencere tutamacındaki `#D8D1C4` yerine `--color-strike`.

| Ekran | Görüntü | Uygulamadaki karşılığı |
| --- | --- | --- |
| Ana ekran · yedek hatırlatması | `09-ana-ekran-yedek-hatirlatmasi.png` | `HomeScreen` + yeni `BackupReminder` |
| Ayarlar · yedek | `10-ayarlar-yedek.png` | `AppSettingsScreen` (yeniden düzenlenir) |
| Yedekten geri yükle | `11-yedekten-geri-yukle.png` | yeni `RestoreSheet` |

`THEME.md` bölüm 0'daki ekran tablosuna bu üç satırı ekle.

Tasarımda çizilmeyen durumlar (hiç yedek yok, yedek güncel, kalıcı depolama kapalı, hata pencereleri) bölüm 7.3'teki metinlerle, aynı yerleşim ve bileşenlerle yapılır. Bu durumlarda renk kuralı: dikkat isteyen durum amber (`--color-amber-soft` zemin, `--color-amber-text` ikon), iyi durum yeşil/teal.

## 3. Genel kurallar

- **Dal:** TripKit'teki bütün işler `ortak-temel` dalında. `main`'e birleştirme ve push, Tolga "yayınla" deyince. `kitshelf-ui` ve `kit-template` canlıya çıkmadığı için doğrudan `main`'de çalışılabilir.
- Her aşama sonunda: `npm test`, `npm run lint`, `npm run build` (pakette `build` yoksa `tsc --noEmit`); B, D ve E'de ekran görüntüleri (bölüm 9); commit; kısa özet; **dur**.
- Arayüz metinleri bölüm 7.3'teki gibi, aynen. Kod yorumları, commit mesajları ve README'ler depolardaki alışkanlıkla İngilizce; `kit-template`'teki "yeni kit açma" rehberi Türkçe.
- Yeni bağımlılık ekleme; gerekiyorsa önce sor.
- Tarayıcı desteğini varsayma, özelliği algıla (`navigator.canShare`, `navigator.storage?.persisted` vb.) ve her dal için yedek yol yaz.
- Mevcut localStorage anahtarlarının ve `quiz-trip` veritabanı adının **adını değiştirme**; değişirse kullanıcıların ayarları ve verisi kaybolur.
- GitHub depoları yoksa ve `gh` kurulu ve oturum açıksa `gh repo create TolgaSenerHollyPalm/<ad> --public` ile aç; değilse Tolga'dan açmasını iste ve bekle.

## 4. Aşama A — `kitshelf-ui` deposu

### 4.1 Neler taşınır

Kural: **en az iki kitin kullanacağı** parça taşınır; emin değilsen TripKit'te bırak (sonra taşımak kolay).

| Taşınır | TripKit'te kalır |
| --- | --- |
| Tokenlar (açık + karanlık), temel stiller, yazı tipleri (`fonts.css`, `@fontsource-variable` bağımlılıkları) | `tripTheme` ve gezi renkleri |
| `Screen`, `Button`/`LinkButton`, `IconButton`/`IconLink`, `ListCard`/`LinkRow`/`ItemRow`, `Tile`, `tone.ts`, `tones.module.css`, `text.module.css` — `'trip'` tonu pakette genel **`'accent'`** olur ve `--accent-color`, `--accent-soft`, `--accent-ink` okur (varsayılanı `--color-primary*`); TripKit `tripTheme`'de bu değişkenleri gezi rengine bağlar | `Countdown`, `CountdownCard` |
| `CheckButton`, `Chip`, `ChoiceGroup`, `ConfirmDialog`, `DeleteButton`, `Disclosure`, `Menu`, `ProgressBar`, `SegmentedTabs`, `Stepper`, `AddField`, `RequiredMark`, `Avatar`, `Missing` | `GuessList`, `StandingsList` (FreeTimeKit gelince taşınır); `StatusBadge`, `ValueField` (`game/` tiplerine bağlı) |
| `OnlineBadge`, `useOnline`, `IosInstallHint` + `installHint.ts` (uygulama adı ve anahtar parametre), `turkish.ts` | `labels.ts`, `TransportIcon`, `TripKindIcon`, `AppIcon` |
| Genel ikonlar: `BackIcon`, `PlusIcon`, `CheckIcon`, `CloseIcon`, `GearIcon`, `SlidersIcon`, `Chevron*`, `DotsIcon`, `ArrowRightIcon`, `RefreshIcon`, `AutoIcon`, `SunIcon`, `MoonIcon`. **Yeni** çizilecekler (SVG'leri maketlerde): paylaş, indir, geçmiş, dosya | `AppMark`, `AppIcon`, `SuitcaseIcon`, `BagIcon`, `ForkKnifeIcon`, `QuizIcon`, `TargetIcon`, `TrophyIcon`, `PeopleIcon`, `BoxIcon`, `StopwatchIcon` |
| `appearance.ts` (anahtar ve `theme-color` değerleri parametre), `ConnectionNotice` (uygulama adı parametre: şu an metinde "TripKit" yazıyor), `toast.module.css`, güncelleme bildiriminin görünümü (`UpdateToast`, prop'larla) | `UpdatePrompt`'taki `useRegisterSW` çağrısı (`virtual:pwa-register/react` kitin eklentisine bağlı); `DesignGallery` (`#/tasarim`) — importları pakete döner |
| Karma router çekirdeği: `useSyncExternalStore` ile `hashchange` dinleyen `useHash()` ve `go(href, { replace })` | `Route` tipi, `href()`, `parseRoute()`; `useRoute()` ve `navigate(route)` aynı adlarla kalır, içleri paketi kullanır (16 çağrı yeri değişmez) |
| `wipeDevice({ databaseNames, ownKeys, beforeDelete, appShell })` — `beforeDelete` kitin kendi bağlantısını kapatır (bugünkü `closeDatabase()`), yoksa silme kendi bağlantımıza takılır | `OWN_KEYS` listesi; `UpdatePrompt`'taki `offline-ready-shown` da listeye eklenir |

Taşınan dosyaların testleri de taşınır (`installHint.test.ts`, `turkish.test.ts`, `appearance.test.ts` vb.).

### 4.2 Yönlendirmeden ayırma

Paketteki bileşenler `Route` bilmez, **adres (`string`)** alır:

- `LinkButton to: Route` → `to: string`; `IconLink to` → `to: string`; `LinkRow to?: Route` → `to?: string` (prop adları aynı kalır)
- `Screen back?: Route` → `back?: string`; `Missing back` → `back: string`
- `IconLink`'e `badge?: boolean` eklenir (ana ekrandaki amber nokta, maket `09`)

TripKit'te çağrılar `to={href({ screen: 'home' })}` biçimine döner. Bu mekanik bir değişiklik; davranış aynı kalır.

### 4.3 Paket biçimi

- `package.json`: `"name": "kitshelf-ui"`, `"private": true` (npm'e yanlışlıkla yayımlanmasın), `"type": "module"`, `"exports": { "./*": "./src/*" }`. İçe aktarma örneği: `import { Button } from 'kitshelf-ui/ui/Button.tsx'`.
- `react`, `react-dom` **peerDependencies**; yazı tipleri **dependencies**.
- Paket **kaynak olarak** dağıtılır (TS + CSS Modules); derlemeyi kitin Vite'ı yapar. Kitte `optimizeDeps: { exclude: ['kitshelf-ui'] }` gerekir. Temiz bir klonda `npm ci && npm run build && npm run dev` çalışmıyorsa kütüphane modunda derleyip (`dist/` + `.d.ts` + tek CSS) etiketle yayımlamaya geç ve nedenini README'ye yaz.
- Kurulum: `"kitshelf-ui": "github:TolgaSenerHollyPalm/kitshelf-ui#v0.1.0"`. Her kit tam etiket sabitler.
- Birlikte geliştirirken geçici olarak `npm install ../kitshelf-ui` kullanılabilir; bu bir sembolik bağ kurar ve paketin kendi `node_modules/react`'i yüzünden iki React yüklenebilir: kitin `vite.config.ts`'ine `resolve: { dedupe: ['react', 'react-dom'] }` ekle. **Commit'ten önce git etiketine dön** (GitHub Actions dosya yolunu bulamaz) ve etiketli kurulumu ayrıca dene.
- `tsc -b` paketteki `.ts`/`.tsx` dosyalarını kitin ayarlarıyla denetler (`skipLibCheck` bunları kapsamaz). README'ye yaz: kitler `vite/client` tiplerini ve aynı sıkılığı korur.
- Olası pürüzler (emin değiliz, çıkarsa uygula): Vitest paketi dönüştürmezse `test.server.deps.inline: ['kitshelf-ui']`; Actions'ta `npm ci` kilit dosyasındaki `git+ssh` adresine takılırsa iş akışına `git config --global url."https://github.com/".insteadOf ssh://git@github.com/` adımı.
- Sürümleme: `v0.x.y`. Kırıcı değişiklik → `x` artar; Aşama B'de pakette düzeltme gerekirse `v0.1.1` gibi yama etiketi. Her etiket için `CHANGELOG.md` satırı.
- Paketin kendi `tsconfig`'i TripKit'teki `tsconfig.app.json` ile aynı sıkılıkta; kendi `vitest` testleri; `oxlint`.

### 4.4 Tokenlar ve kit rengi

- `src/styles/tokens.css`: `src/index.css`'teki açık ve karanlık listenin tamamı. Varsayılan vurgu TripKit teal.
- Her kit kendi vurgusunu kendi CSS dosyasında ezer: `--color-primary`, `--color-primary-dark`, `--color-primary-soft`, `--color-on-primary` (açık ve `[data-scheme='dark']` için ayrı).
- README'ye kural: buton yazısı ile `--color-primary` arasında en az 4.5:1. Amber gibi açık renklerde `--color-on-primary` koyu olmalı.

### 4.5 Aşama A kabul

- `kitshelf-ui` testleri ve lint geçiyor; README'de kurulum, sürümleme, bileşen ve token listesi, kit rengi kuralı var.
- `v0.1.0` etiketi GitHub'a gönderildi.
- **Dur.**

## 5. Aşama B — TripKit `kitshelf-ui`'ye geçer (görünüm değişmez)

- `ortak-temel` dalında: bağımlılık `#v0.1.0`, importlar pakete döner, taşınan dosyalar TripKit'ten silinir, `index.css` paketin tokenlarını ve temel stillerini içe aktarır, TripKit'e özgü olanlar kalır.
- `vite.config.ts`: `optimizeDeps.exclude`, `workbox.globPatterns` `woff2`'yi hâlâ içeriyor.
- **Görsel eşitlik:** geçişten önce ve sonra aynı ekranların görüntüsünü al (bölüm 9) ve karşılaştır. Fark sıfır olmalı; varsa ya düzelt ya da nedenini yaz (ör. CSS sırası).
- Çevrimdışı: `npm run build && npm run preview`, uçak modunda yazı tipleri dahil açılıyor.
- **Dur.**

## 6. Aşama C — Yedekleme çekirdeği (`kitshelf-ui` v0.2.0)

Kitten bağımsız, saf fonksiyonlar ağırlıklı; hepsi testli.

### 6.1 Dosya biçimi

```json
{
  "format": "kitshelf-backup",
  "formatVersion": 1,
  "kit": "tripkit",
  "kitName": "TripKit",
  "dataVersion": 4,
  "exportedAt": "2026-08-26T18:40:00.000Z",
  "appBuild": "2026-08-20T09:12:00.000Z",
  "summary": { "trips": 3, "packs": 2, "listItems": 41 },
  "data": { }
}
```

- `formatVersion`: zarfın sürümü (hep 1, zarf değişirse artar).
- `kitName`: hata mesajında başka kitin adını göstermek için.
- `appBuild`: bağdaştırıcıdan gelir (TripKit'te `__BUILD_TIME__`; paket bu global'i bilmez).
- `dataVersion`: `data`'nın şekli, kitin kendi sürümü. TripKit'te IndexedDB sürümüyle aynı (şu an 4).
- `summary`: dosyayı açan insan için. Önizleme bu alana güvenmez, `data`'dan yeniden hesaplanır.
- Dosya adı: `<kit>-yedek-YYYY-MM-DD.json`, **yerel** tarih. Ör. `tripkit-yedek-2026-08-26.json`.
- Görünüm ayarı gibi cihaz tercihleri yedeğe girmez.

### 6.2 Kit bağdaştırıcısı

```ts
interface BackupAdapter<Data> {
  kit: string               // 'tripkit'
  kitName: string           // 'TripKit'
  dataVersion: number       // 4
  appBuild: string          // derleme zamanı
  exportData(): Data        // bellekteki güncel veri; senkron (bkz. 6.3)
  summarize(data: Data): { key: string; count: number; label: string }[] // "3 seyahat"
  migrate(data: unknown, from: number): unknown // eski dataVersion → güncel; bilinmeyen sürümde hata
  validate(data: unknown): data is Data         // yapı kontrolü, bkz. 6.4
  restore(data: Data, mode: 'merge' | 'replace'): Promise<RestoreResult> // tek transaction
  // RestoreResult: her veri türü için { key, label, added, updated, total }; TripKit'te seyahat ve soru paketi
  lastChangeAt(): string | undefined            // kullanıcının son değişikliği (ISO)
  hasUserData(): boolean
}
```

Paket `mergeById(local, incoming, { newer })` yardımcısını verir: yerelde olmayan eklenir; ikisinde de olanın daha yenisi kalır; eşitse yerel kalır; `updatedAt`'i olmayan en eski sayılır. Sonuç: `{ items, added, updated, unchanged }`.

### 6.3 Kaydetme (dışa aktarma)

`saveBackup(adapter)`:

1. Zarfı bellekteki veriden üret. `navigator.share()` kullanıcının dokunuşundan hemen sonra çağrılmalı; öncesinde IndexedDB okuması gibi uzun `await` olursa tarayıcı `NotAllowedError` verir.
2. `File` oluştur (`application/json`). `navigator.canShare?.({ files: [file] })` doğruysa `navigator.share({ files: [file], title })`.
   - `AbortError` (kullanıcı vazgeçti) → sonuç `cancelled`, yedek tarihi **yazılmaz**.
   - `NotAllowedError` ya da başka hata → 3. adıma düş.
3. Aksi halde indir: `URL.createObjectURL` + `<a download>` tıklaması; `revokeObjectURL`'ü hemen değil birkaç saniye sonra çağır (hemen çağrılınca bazı tarayıcılar indirmeyi iptal eder).
4. Paylaşım ya da indirme başladıysa son yedek tarihini yaz.

Testler Node'da, DOM'suz çalıştığı için `saveBackup` paylaşma ve indirme işlevlerini dışarıdan alabilmeli (varsayılanı tarayıcınınkiler).

Bilinen sınır: Chrome'un paylaşıma izin verdiği dosya türleri listesinde (masaüstü kaynak kodunda doğrulandı) `.json` yok; Android'de de büyük olasılıkla `canShare` yanlış döner ve dosya indirilir. Bunu gerçek telefonda dene ve raporda yaz. Dosya uzantısını `.txt`'ye çevirme.

### 6.4 Geri yükleme (içe aktarma)

`readBackup(file, adapter)` → `{ ok: true, backup, preview } | { ok: false, error }`. Sıra:

1. 20 MB'tan büyükse reddet.
2. JSON değilse ya da `format !== 'kitshelf-backup'` ise → `not-backup`.
3. `kit !== adapter.kit` → `other-kit` (mesajda dosyadaki `kitName` geçer). Kit kontrolü sürümden **önce**: başka kitin yeni bir yedeği "güncelle" mesajı almasın.
4. `formatVersion > 1` ya da `dataVersion > adapter.dataVersion` → `too-new`.
5. `migrate` → `validate`. Bir kayıt bile geçersizse **hepsi** reddedilir → `damaged`. Aynı kimlik iki kez geçiyorsa geçersiz. Doğrulayıcı yalnızca yapıya bakar (tipler, zorunlu alanlar); kitin kendi eski ve migration'dan geçmiş kayıtlarını reddetmemeli (bkz. 7.4).
6. Önizleme: dosya adı, `exportedAt`, `summarize(data)`.

Yazma adımı (`adapter.restore`) tek IndexedDB transaction'ı içinde; hata olursa hiçbir şey değişmez.

Geri yüklemeden sonra son yedek tarihi `max(kayıtlı, backup.exportedAt)` olur: cihazdaki veri o anki yedekte var demektir.

Dosya seçimi: görünmez `<input type="file">`, `accept` **olmadan** (bazı Android dosya sağlayıcıları `.json`'u farklı türle bildirip gri gösterebilir; ayıklamayı doğrulama yapar). "Yedekten geri yükle" ona tıklar.

### 6.5 Kalıcı depolama

`storageStatus()` → `'granted' | 'not-granted' | 'unknown'` (`navigator.storage?.persisted`). `unknown` iken Ayarlar'da satır gösterilmez. İstek (`persist()`) açılışta yapılmaya devam eder; ekrana ayrıca buton koyma.

### 6.6 Hatırlatma

Saf fonksiyon, tarih parametreli:

```
backupDue({ now, hasUserData, lastBackupAt?, dataSince?, lastChangeAt?, snoozedUntil? })
  due =
    hasUserData && (
      (!lastBackupAt && dataSince && now − dataSince ≥ 7 gün)
      || (lastBackupAt && now − lastBackupAt ≥ 30 gün && lastChangeAt > lastBackupAt)
    )
  showBanner = due && !(snoozedUntil && now < snoozedUntil)
  reason = lastBackupAt ? 'old' : 'never'
```

- `dataSince`: kullanıcı verisi ilk görüldüğü an (yoksa şimdi yazılır). Bu güncellemeyi alan mevcut kullanıcılar için de "şimdi"den başlar.
- Afişteki kapat düğmesi `snoozedUntil = now + 7 gün` yazar.
- Ayarlar ikonundaki nokta `due` iken görünür, afiş kapatılsa bile.
- Durum anahtarları `<ön ek>last-backup`, `<ön ek>data-since`, `<ön ek>backup-snoozed-until` (TripKit'te ön ek `tripkit-`). Paket bu anahtarların listesini verir; `wipeDevice` bunları da siler.
- 7 ve 30 gün geçen süre olarak ölçülür (7 × 24 saat). Ekrandaki "Bugün", "Dün", "34 gün önce" ise yerel takvim günüyle.
- Bütün seyahatler silinince `dataSince` silinir; veri yeniden oluşunca sayaç yeniden başlar.
- Seyahat ya da paket silmek "değişiklik" sayılmaz (`lastChangeAt`'i ilerletmez). Kabul edilen sınır.

### 6.7 Paketteki arayüz parçaları

Hepsi bölüm 2'deki tasarıma göre, tokenlarla, açık ve karanlık temada:

- `BackupCard`: son yedek satırı, açıklama, "Yedeği kaydet", "Yedekten geri yükle", gizli dosya seçici.
- `RestoreSheet`: alttan açılan `<dialog>` (mevcut `ConfirmDialog` gibi `showModal`, Esc ve Android geri hareketi kapatır); dosya kartı, sayılar, "Nasıl yüklensin?" (yerel `fieldset` + `input type="radio"`), "Geri yükle", "Vazgeç". "Değiştir" seçiliyken ve cihazda veri varken önce onay penceresi.
- `BackupReminder`: ana ekran afişi (`role="status"`).
- `StorageStatus`: "Bu cihazda" kartının üst satırı.
- `InfoDialog`: tek butonlu bilgi penceresi (hatalar için).
- `Toast` ve `useToast()`: kısa bildirim, `role="status"`, 4 sn (indirildi bildirimi 6 sn). Sağlayıcı `App.tsx`'te `AppDataProvider`'ı da sarar; bildirimler mevcut toast yığınında (`UpdatePrompt`, `ConnectionNotice`'in yanında) görünür.
- Silme ve sürüm bölümü için `SettingsFooter` ("Sürüm: …", "KitShelf ailesinden" → `https://kitshelf.app`).

### 6.8 Testler

- Zarf üretme ve dosya adı (yerel tarih, gece yarısı sınırı).
- `readBackup` her hata türü + başarılı yol; 20 MB sınırı.
- `mergeById`: yok / yeni / eski / eşit / `updatedAt` yok.
- `backupDue`: tablo testi (hiç yedek yok 6. ve 7. gün, 29. ve 30. gün, değişiklik yok, erteleme süresi içinde ve sonrası).
- `saveBackup`: `navigator` taklidiyle paylaşım, `AbortError`, `NotAllowedError` → indirme, `canShare` yok → indirme.

**Kabul:** testler geçiyor, README'de yedekleme bölümü var, `v0.2.0` etiketi gönderildi. **Dur.**

## 7. Aşama D — TripKit'e yedekleme

### 7.1 Veri

- `TripState`'e `updatedAt?: string` (ISO). `AppDataProvider.saveTrip` her kayıtta damgalar. IndexedDB sürümü **artmaz**; eski kayıtlarda alan yok ve birleştirmede en eski sayılır.
- Bağdaştırıcı `src/backup/tripkitBackup.ts`; bellekteki `AppData`'yı okuduğu için bir hook içinde kurulur (ör. `useTripkitBackup()`):
  - `data = { trips: TripState[], packs: Pack[] }`, bellekteki `AppData`'dan.
  - Özet: seyahat sayısı, soru paketi sayısı, liste maddesi (`checklist + souvenirs + tastes`). Sıfır olanlar önizlemede gösterilmez.
  - `validate`: seyahatler için yapı kontrolü (kimlik ve ad metin, listeler dizi, madde alanları doğru tipte…); paketler için mevcut `packs/validate.ts`.
  - `migrate`: şimdilik yalnızca 4. İleride DB sürümü artınca aynı migration fonksiyonları buradan da geçirilir; bu kuralı `db.ts`'e yorum olarak yaz.
  - `lastChangeAt`: seyahatlerin en büyük `updatedAt`'i. `hasUserData`: en az bir seyahat.
- `db.ts`'e `restoreBackup(data, mode)`: `['packs', 'trips']` üzerinde tek `readwrite` transaction. `idb` kuralları: bütün okumalar aynı transaction'dan, birleştirme hesabı senkron, arada IndexedDB isteği olmayan hiçbir şey `await` edilmez; sonunda `Promise.all([...yazmalar, tx.done])`. Geri yükleme `saveTrip`'ten geçmez, `updatedAt` yedekteki gibi kalır.
  - Birleştir: seyahatler `mergeById` kuralıyla; paketler yerelde yoksa eklenir, varsa **daha yüksek `version`** kalır.
  - Değiştir: iki depo temizlenir, yedektekiler yazılır.
  - Silmeler taşınmaz: bir cihazda silinen seyahat, eski bir yedek birleştirilince geri gelir. Bu kabul edilen sınır; README'ye yaz.
  - Aynı seyahat iki cihazda değiştirildiyse daha yeni kayıt **bütünüyle** kalır, madde düzeyinde birleştirme yok. Cihaz saatleri farklıysa "yeni" o saate göredir.
- Geri yüklemeden sonra `AppDataProvider` veriyi IndexedDB'den yeniden yükler, `currentTrips`'i günceller, `checkPacks()` çağırır.
- `OWN_KEYS`'e yedek anahtarları eklenir.

### 7.2 Ekranlar

- **Ayarlar** (`10`): sıra Yedek → Görünüm → Bu cihazda (kalıcı depolama + dört sayı) → Verileri sil → sürüm ve "KitShelf ailesinden". Eski "hiçbiri sunucuya gönderilmiyor…" paragrafı kalkar; yerini Yedek kartındaki metin alır.
- **Geri yükle** (`11`): dosya seçilince açılır. Hata varsa sayfa değil `InfoDialog` açılır, hiçbir şey değişmez.
- **Ana ekran** (`09`): `showBanner` iken başlığın altında afiş (iOS'taki `IosInstallHint` de görünüyorsa önce o, sonra afiş); `due` iken ayarlar ikonunda amber nokta ve ikon etiketi "Ayarlar, yedek zamanı". "Şimdi yedekle" Ayarlar'a gider. Hiç seyahat yokken afiş yok.
- **Silme onayı**: metin son yedeğe göre değişir (bölüm 7.3).

### 7.3 Metinler

| Yer | Metin |
| --- | --- |
| Bölüm başlığı | Yedek |
| Satır etiketi | Son yedek |
| Değer: hiç yok | Henüz yedek almadın |
| Değer: bugün / dün | Bugün · 29 Eylül / Dün · 28 Eylül |
| Değer: daha eski | 34 gün önce · 26 Ağustos (başka yıldaysa "26 Ağustos 2025") |
| Etiket (yalnızca `due` ve `old`) | Eski |
| Açıklama | Seyahatlerin yalnızca bu cihazda duruyor. Yedek dosyasını Drive’a, e-postana ya da kendine gönder; telefon değişirse buradan geri yüklersin. |
| Ana buton / meşgul | Yedeği kaydet / Hazırlanıyor… |
| İkincil buton | Yedekten geri yükle |
| Bildirim: paylaşıldı | Yedek gönderildi. |
| Bildirim: indirildi | Yedek indirildi: tripkit-yedek-2026-09-29.json. İndirilenler'den Drive'a ya da e-postana gönderebilirsin. |
| Bildirim: hata | Yedek kaydedilemedi. Tekrar dene. |
| Pencere başlığı | Yedekten geri yükle |
| Dosya kartı | tripkit-yedek-2026-08-26.json · 26 Ağustos 2026, 21:40 |
| Sayılar | 3 seyahat · 2 soru paketi · 41 liste maddesi |
| Seçim başlığı | Nasıl yüklensin? |
| Birleştir (+ "Önerilen") | Bu cihazda olmayan seyahatler eklenir. İkisinde de olan seyahatin daha yeni hâli kalır. Hiçbir şey silinmez. |
| Değiştir | Bu cihazdaki seyahatler ve paketler silinir, yerine yedektekiler gelir. |
| Butonlar / meşgul | Geri yükle / Yükleniyor… · Vazgeç |
| Değiştir onayı: başlık | Bu cihazdaki seyahatler silinsin mi? |
| Değiştir onayı: metin | Bu cihazdaki {n} seyahat ve {m} soru paketi silinecek, yerine yedekteki {x} seyahat gelecek. Geri alınamaz. |
| Değiştir onayı: buton | Evet, değiştir |
| Bildirim: birleştirildi | Geri yüklendi: {a} seyahat eklendi, {u} seyahat güncellendi, {p} soru paketi eklendi, {q} soru paketi güncellendi. (sıfır olan kısımlar yazılmaz) |
| Bildirim: değişen yok (dördü de sıfır) | Yedekteki her şey bu cihazda zaten var. |
| Bildirim: değiştirildi | Geri yüklendi: {x} seyahat, {y} soru paketi. |
| Hata penceresi başlığı / buton | Yedek açılamadı / Tamam |
| Hata: `not-backup` | Bu dosya bir KitShelf yedeği değil. |
| Hata: `other-kit` | Bu bir {BookKit} yedeği. TripKit'e yalnızca TripKit yedekleri yüklenebilir. |
| Hata: `too-new` | Bu yedek TripKit'in daha yeni bir sürümüyle alınmış. Önce uygulamayı güncelle, sonra tekrar dene. |
| Hata: `damaged` | Yedek dosyası bozuk görünüyor. Hiçbir şey değiştirilmedi. |
| Hata: yazma | Geri yükleme tamamlanamadı. Hiçbir şey değiştirilmedi. |
| Afiş başlığı | Henüz yedeğin yok / Son yedeğin 34 gün önce |
| Afiş metni | Telefonun değişirse seyahatlerin kaybolmasın. |
| Afiş bağlantısı / kapat | Şimdi yedekle / Hatırlatmayı kapat (erişilebilir ad) |
| Kalıcı depolama: açık | Kalıcı depolama açık — Tarayıcı yer açmak için bu verileri kendiliğinden silmez. |
| Kalıcı depolama: kapalı | Kalıcı depolama kapalı — Telefonda yer azalırsa tarayıcı bu verileri silebilir. Düzenli yedek al. |
| Verileri sil metni | Bu cihazdaki her şeyi siler: seyahatler, oyuncular, puanlar, listeler, indirilmiş soru paketleri ve ayarlar. Geri alınamaz; silmeden önce yedek al. |
| Silme onayı, son cümle | Yedek varsa: "Son yedeğin {26 Ağustos}; ondan sonraki değişiklikler geri gelmez." Yoksa: "Yedeğin yok; silinenler geri gelmez." |
| Alt bilgi | Sürüm: {derleme zamanı} · KitShelf ailesinden |

### 7.4 Testler

- `updatedAt` damgası; bağdaştırıcının `validate`'i (geçerli, eksik alan, yanlış tip, yinelenen kimlik).
- `validate(exportData())` migration testlerindeki eski kayıtlardan (`migrations.test.ts` örnekleri) geçen seyahatlerle doğru dönüyor: kendi yedeğimiz hiçbir zaman "bozuk" sayılmamalı.
- `restoreBackup` birleştir ve değiştir, `fake-indexeddb` yoksa saf birleştirme fonksiyonu üzerinden (yeni bağımlılık eklemeden önce sor).
- Uçtan uca elle (bölüm 9).

**Dur.** Tolga telefonda denedikten ve "yayınla" dedikten sonra `ortak-temel` → `main`.

## 8. Aşama E — `kit-template` deposu

Yeni kitin (ilk olarak BookKit) başlayacağı GitHub şablon deposu.

- TripKit'le aynı iskelet: Vite + React + TS, PWA (manifest, ikonlar, `woff2` önbellekte), `kitshelf-ui` bağımlılığı, `deploy.yml`, `UpdatePrompt`, `ConnectionNotice`, görünüm ayarı ve ilk boyamadan önce çalışan `index.html` betiği.
- Kit kimliği, adı ve rengi tek yerden gelir (ör. `.env` + `index.html`'de `%VITE_KIT_ID%`, kodda `src/kit.ts`). localStorage anahtarları bu kimlikle ön eklidir.
- Örnek veri: basit bir "Notlar" deposu (kimlik, metin, `updatedAt`); ana ekran boş durum + liste. Amaç, yedekleme ve geri yüklemenin uçtan uca çalıştığını göstermek; yeni kit bunu kendi verisiyle değiştirir.
- Hazır Ayarlar ekranı: Yedek, Görünüm, Bu cihazda, Verileri sil, sürüm.
- `deploy.yml` şablon deponun kendisinde çalışmasın: `if: github.repository != 'TolgaSenerHollyPalm/kit-template'`.
- Türkçe `YENI-KIT.md`: şablondan depo aç → kit kimliği/adı/rengi → renk kontrastı kontrolü → ikonlar → Settings › Pages › Source: GitHub Actions → Cloudflare'de `CNAME <alt-ad> → tolgasenerhollypalm.github.io` (proxy kapalı) → Pages'te özel alan adı ve Enforce HTTPS.
- Depoyu şablon olarak işaretle (`gh repo edit --template` ya da Settings).

**Kabul:** şablondan açılmış deneme deposu `npm ci && npm test && npm run build` geçiyor; notlar dışa aktarılıp başka tarayıcıya geri yükleniyor. **Dur.**

## 9. Doğrulama

Her aşama sonunda:

- 390 ve 360 px genişlikte, açık ve karanlık temada ekran görüntüleri; Aşama B'de önce/sonra karşılaştırması. Playwright kullanılabilir (`npx playwright install chromium`).
- 360 px'te yatay kaydırma yok, metin taşmıyor; dokunma alanları en az 44 px; yazı kontrastı en az 4.5:1, ikon ve kenarlar 3:1.

Aşama D'den sonra Tolga ile telefonda. Paylaşım menüsü ve service worker yalnızca HTTPS'te (ya da `localhost`'ta) çalışır; yerel ağdaki `http://192.168…` adresinde denenemez. Yollar, Tolga seçer:

- Android'i USB ile bağla, Chrome'un `chrome://inspect` port yönlendirmesiyle telefonda `localhost:4173`'ü aç (`npm run build && npm run preview`).
- `cloudflared tunnel --url http://localhost:4173` ile geçici bir HTTPS adresi al (hesap gerekmez; `cloudflared` kurulu değilse önce sor).
- Masaüstünde dene, yayınla, hemen telefonda dene; sorun çıkarsa `main`'deki birleştirmeyi geri al.

Denenecekler:

1. Android Chrome, yüklü uygulama: "Yedeği kaydet" → paylaşım menüsü mü açıldı, dosya mı indi? Hangisi olduğunu yaz. Dosya bir metin görüntüleyicide açılıyor.
2. iPhone Safari, ana ekrandaki uygulama: paylaşım menüsü → "Dosyalar'a Kaydet".
3. Dosyayı başka bir tarayıcıda (masaüstü Chrome) birleştirerek yükle: sayılar doğru, seyahat açılıyor, yarım kalmış yarışma devam ediyor.
4. "Değiştir": onay penceresi çıkıyor, sonuç doğru.
5. Yanlış dosyalar: fotoğraf, rastgele bir JSON, `kit` alanı elle `bookkit` yapılmış yedek, `dataVersion: 99` → doğru mesaj, hiçbir şey değişmiyor.
6. Uçak modunda kaydetme ve geri yükleme çalışıyor.
7. Hatırlatma: geliştirici araçlarında `tripkit-last-backup` / `tripkit-data-since` tarihlerini geriye alarak afiş ve nokta; kapatınca afiş 7 gün yok, nokta duruyor; yedek alınca ikisi de gidiyor.
8. "Tüm verileri sil" → yedek anahtarları da siliniyor; sonra geri yükleme her şeyi getiriyor.

## 10. Kapsam dışı

- Otomatik eşitleme, bulut, hesap.
- Dosya şifreleme.
- Madde düzeyinde birleştirme ve silmelerin taşınması.
- Ana sitedeki (`kitshelf.app`) "İstediğin zaman dosya olarak yedekle." cümlesi: yedekleme canlıya çıkınca ayrıca eklenecek.
- BookKit'in kendisi (2. adım).
