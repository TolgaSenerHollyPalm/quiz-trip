# KitShelf 2. adım — BookKit

Bu dosya Claude Code için çalışma talimatıdır. Önce tamamını oku, sonra `design/screens/` altındaki görüntülere bak, **Aşama A**'dan başla. Her aşamanın sonunda dur, kısa özet ver, Tolga'nın onayını bekle.

## 0. Amaç

**BookKit** (`https://book.kitshelf.app`): okuduğun, okumakta olduğun ve okumak istediğin kitaplar; her kitap için okurken ya da bitirince alınan kısa notlar ve alıntılar. KitShelf'in diğer kitleri gibi ücretsiz, hesapsız, çevrimdışı; veri cihazda kalır, dosyayla yedeklenir.

Farkı: sade, reklamsız, hesap istemiyor, veri kullanıcıda.

## 1. Önkoşullar

- 1. adım (`quiz-trip/docs/plans/01-ortak-temel/PLAN.md`) **Aşama E dahil** bitmiş olmalı: `kitshelf-ui` en az `v0.2.x` etiketli, `kit-template` GitHub'da şablon depo. Değilse dur ve Tolga'ya söyle.
- Başlamadan önce oku: `~/MyProjects/kit-template/YENI-KIT.md` (ya da README'si) ve `~/MyProjects/kitshelf-ui/README.md`. Bu planda geçen dosya, bileşen ve API adları onlarla çelişirse **onlarınki geçerli**; farkı özetinde yaz. Ayarlar ekranı ve yedek bağlantıları `kit-template`'ten gelir.
- `kitshelf-ui`'de eksik bir şey çıkarsa (ör. bildirimde "Aç" gibi bir eylem düğmesi) **geriye uyumlu** olarak ekleyebilirsin: yeni etiket (`v0.3.0` gibi), `CHANGELOG.md` satırı, paketin testleri geçiyor, TripKit etkilenmiyor. Aşama özetinde yaz.
- Depo: `TolgaSenerHollyPalm/bookkit` (herkese açık), yerelde `~/MyProjects/bookkit`. `gh` varsa şablondan sen aç (`gh repo create TolgaSenerHollyPalm/bookkit --public --template TolgaSenerHollyPalm/kit-template --clone`); yoksa Tolga'dan iste.

## 2. Tasarım

Bu klasördeki `design/` dosyalarını Aşama A'da yeni deponun `docs/design/bookkit/` klasörüne kopyala.

| Ekran | Görüntü | Not |
| --- | --- | --- |
| Aile: ikonlar ve renkler | `00-aile.png` | BookKit sütunu: renkler, açık/koyu örnek |
| Kitaplık | `01-kitaplik.png` | ana ekran |
| Kitap ekle | `02-kitap-ekle.png` | arama sonuçları, durum seçimi |
| Kitap | `03-kitap.png` | "Okuyorum" durumundaki kitap, notlar ve alıntılar |
| Not ekle | `04-not-ekle.png` | kitabın üstünde alttan açılan pencere |

- `html/` ölçü ve renklerin kaynağı; satır içi stilleri kopyalama, `kitshelf-ui` bileşenlerine ve tokenlarına çevir. Çelişkide öncelik: **bu dosya > `kitshelf-ui` > `html/`**.
- `design/icons/bookkit-icon.svg` uygulama ikonu, `bookkit-maskable.svg` maskelenebilir ikon (tam zemin, içerik %80 güvenli alanda). PWA ikonlarını ve favicon'u bunlardan üret (TripKit'teki `scripts/generate-icons.sh` yöntemi).
- Tasarımda çizilmeyen ekranlar ve durumlar (bölüm 5'te tarif edildi) aynı bileşenlerle, aynı ölçülerle yapılır. Yeni bir görsel dil icat etme.

### 2.1 BookKit renkleri

| Token | Açık tema | Koyu tema |
| --- | --- | --- |
| `--color-primary` | `#9B3D63` | `#F29BBE` |
| `--color-primary-dark` (bağlantı, açık zemin üstü yazı) | `#7E2F50` | `#F6B8D1` |
| `--color-primary-soft` | `#F6E6EC` | `#3E1A2A` |
| `--color-on-primary` | `#FFFFFF` | `#3A0E22` |

Zemin, yazı ve diğer tonlar `kitshelf-ui`'deki gibi; `theme-color` açık `#F7F5F0`, koyu `#111615`. Kontrastlar hesaplandı (hepsi ≥ 4.5:1); değer değiştirirsen yeniden hesapla.

### 2.2 Üretilen kapak

Kapak resmi yoksa uygulama kendi kapağını çizer (tasarımdaki kapakların hepsi bu tür; gerçek kapak görüntüsü değil):

- Düz renk zemin, sol kenarda ince açık bir sırt çizgisi, üstte kitap adı (Bricolage 700), altta yazar (Figtree 600). Yazı rengi `#FFF4E6`.
- Renk, kitap adının normalleştirilmiş hâlinden kararlı bir özetle (hash) şu listeden seçilir; aynı kitap hep aynı rengi alır: `#2F5D50`, `#8C5E1C`, `#3E5C76`, `#A0522D`, `#5A4A78`, `#4F5B3A` (hepsi `#FFF4E6` ile ≥ 5.1:1).
- Boyutlar: liste kartı 64×96, arama sonucu 40×60 (yalnızca ad), kitap sayfası 120×180.

## 3. Genel kurallar

- Her aşama sonunda: `npm test`, `npm run lint`, `npm run build`; 390 ve 360 px genişlikte, açık ve koyu temada ekran görüntüleri, tasarımla karşılaştırma; commit; kısa özet; **dur**.
- Arayüz metinleri Türkçe ve bölüm 9'daki gibi. Kod yorumları, commit mesajları ve README İngilizce (diğer depolar gibi).
- Yeni bağımlılık ekleme; gerekiyorsa önce sor.
- Tarayıcı ve servis davranışını varsayma: dene, sonucu raporla.
- **Yayın Aşama F'de.** O zamana kadar `deploy.yml` yalnızca elle çalışsın (`push` tetikleyicisini kapat, `workflow_dispatch` kalsın), alan adı bağlanmasın, Pages açılmasın. Şablondan açılan deponun ilk commit'i iş akışını bir kez çalıştırıp Pages kapalı olduğu için hata verebilir; beklenen bir durum, düzeltmeye çalışma.
- Önizlemeyi TripKit'ten farklı bir portta çalıştır (ör. `vite preview --port 4175`); aynı portta TripKit'in service worker'ı BookKit'in yerine TripKit'i açabilir.
- Bütün localStorage anahtarları `bookkit-` ön ekli; IndexedDB adı `bookkit`.

## 4. Veri

### 4.1 Tipler

```ts
type BookStatus = 'want' | 'reading' | 'read' | 'abandoned'

interface Book {
  id: string                 // crypto.randomUUID()
  title: string
  authors: string[]          // boş olabilir
  isbn?: string              // ISBN-13, yalnızca rakam
  status: BookStatus
  startedAt?: string         // YYYY-MM-DD, yerel tarih
  finishedAt?: string        // YYYY-MM-DD; 'read' ve 'abandoned' için bitirme / bırakma günü
  rating?: 1 | 2 | 3 | 4 | 5 // yalnızca 'read'
  coverUrl?: string          // kapağın indirildiği adres; yedekten dönünce yeniden indirmek için
  source?: { kind: 'openlibrary' | 'googlebooks' | 'manual'; id?: string }
  notes: BookNote[]
  createdAt: string          // ISO
  updatedAt: string          // ISO, her kayıtta damgalanır
}

interface BookNote {
  id: string
  kind: 'note' | 'quote'
  text: string
  page?: number              // 1–9999
  createdAt: string          // ISO
}
```

- Notlar kitabın içinde durur (TripKit'te listelerin seyahatin içinde durması gibi); yedek birleştirmesi kitap düzeyinde çalışır.
- IndexedDB `bookkit`, sürüm 1: `books` (keyPath `id`), `covers` (keyPath yok, anahtar dışarıdan: kitap kimliği; değer `{ blob: Blob, type: string, url: string }`). iPhone Safari'de Blob saklamayı Aşama D'de dene; sorun çıkarsa `ArrayBuffer` sakla.
- Migration iskeletini şimdiden kur (TripKit `db.ts` + `migrations.ts` gibi); ileride sürüm artınca yedek içe aktarma da aynı fonksiyonlardan geçer.

### 4.2 Kurallar

**Durum geçişleri** (tek kaynak; Düzenle formu da buna uyar):

| Eylem | Nereden | Sonuç |
| --- | --- | --- |
| Okumaya başla | `want` | `reading`, `startedAt` = bugün |
| Bitirdim | `reading` | `read`, `finishedAt` = bugün |
| Yarım bıraktım | `reading` | `abandoned`, `finishedAt` = bugün, puan silinir |
| Tekrar başla | `abandoned` (kitap sayfasındaki düğme), `read` (Düzenle'de durumu "Okuyorum" yapınca) | `reading`, `startedAt` = bugün, `finishedAt` ve puan silinir. `read`'den geliyorsa önce onay: "Bitirme tarihi ve puan silinecek." |

- Eklerken "Okuyorum" seçilirse `startedAt` = bugün. "Okudum" seçilirse altta isteğe bağlı "Bitirme tarihi" alanı çıkar, boş gelir. Boş kalırsa `finishedAt` yok: kitap "Bu yıl" sayısına girmez ve Okudum sekmesinde en sona düşer. Böylece yıllar önce okunmuş kitaplar bu yılın sayısını şişirmez.
- Düzenle formunda: "Okumak istiyorum" iki tarihi de siler; "Okuyorum" `finishedAt`'i ve puanı siler; puan yalnızca `read`'de. `finishedAt` ≥ `startedAt`; ileri tarih seçilemez.
- Her değişiklikte `updatedAt` damgalanır (yedekten geri yüklemede damgalanmaz).

**Sayılar ve sıralama**

- "Bu yıl n kitap": `status === 'read'` ve `finishedAt` bu yıl olanlar. Yarım bırakılanlar sayılmaz.
- Sekme sayıları: Okuyorum = `reading`; Okumak istiyorum = `want`; Okudum = `read` + `abandoned`.
- Sıralama (hepsi yeniden eskiye; tarih eşitse `createdAt` yeniden eskiye; tarihi olmayanlar en sonda):
  - Okuyorum: `startedAt`. Okumak istiyorum: `createdAt`. Okudum: `finishedAt`.
  - Notlar: `createdAt`. "Son notun": bütün kitaplardaki en yeni not.
- Açılışta seçili sekme Okuyorum; boşsa Okumak istiyorum; o da boşsa Okudum. Sekme değişimi adresi `replace` ile günceller (geri tuşu sekmeler arasında dolaşmaz).

**Tarihler**

- `startedAt`/`finishedAt` yerel gün (`YYYY-MM-DD`). ISO zaman damgalarından gün çıkarırken yerel saat dilimini kullan (`slice(0, 10)` değil).
- Ekli biçim yalnızca ay adına ek gelen yerlerde, yılsız: "12 Eylül’de başladın", "3 Ekim’de bitirdin". Ay ekleri sabit tablo: Ocak’ta, Şubat’ta, Mart’ta, Nisan’da, Mayıs’ta, Haziran’da, Temmuz’da, Ağustos’ta, Eylül’de, Ekim’de, Kasım’da, Aralık’ta.
- Tarih başka bir yıldansa ek kullanma, iki nokta ile yaz: "Başladın: 12 Eylül 2025". Yıla ek getirmek sayının okunuşuna bağlı; kaçınıyoruz.
- Kitap sayfasındaki tarih satırı hep eksiz (maketteki "12 Eylül 2026’da başladın" yerine):
  - Okuyorum: "Başladın: 12 Eylül 2026"
  - Okudum: "12 Eylül – 3 Ekim 2026"; yıl değişiyorsa "20 Aralık 2025 – 3 Ocak 2026"; başlama yoksa "Bitirdin: 3 Ekim 2026"; ikisi de yoksa satır yok.
  - Yarım bıraktım: "Bıraktın: 3 Ekim 2026"
  - Okumak istiyorum: "Eklendi: 12 Eylül 2026"

**Aynı kitap ve eşleştirme**

- Eşleştirme anahtarı `matchKey(text)`: NFC, Türkçe duyarlı küçük harf, kesme işaretleri (’ ‘ ') ve noktalama atılır, harf olmayanlar boşluk olur, boşluklar teke iner, aksanlar katlanır (ı→i, ş→s, ğ→g, ü→u, ö→o, ç→c, â→a, î→i, û→u). Örnekler: "SAATLERİ  AYARLAMA Enstitüsü" → "saatleri ayarlama enstitusu"; "Aşk-ı Memnu" → "ask i memnu"; "Tanpinar" ve "Tanpınar" → "tanpinar".
- Aynı kitap: ISBN'ler eşitse, ya da `matchKey(ad)` eşit ve (iki kitabın da yazarı yoksa ya da `matchKey(ilk yazar)` eşitse).
- Aramada kitaplıkta olan sonuç "Kitaplığında var" olur ve seçilemez. Elle ekle ve Düzenle'de engellemez, uyarır: "Kitaplığında aynı adlı bir kitap var." + "Yine de ekle".
- Görünen adı düzeltme (`displayTitle`): yalnızca ad tamamen büyük harfse, Türkçe duyarlı baş harf büyütme; "ve", "ile", "de", "da", "ki", "mi" ilk kelime değilse küçük kalır.

**ISBN**

- Arama metninden tire ve boşluk atılınca 10 haneli (son karakter X olabilir) ya da 13 haneli ve sağlama rakamı doğruysa ISBN aramasıdır; ISBN-10, 13'e çevrilir. Sağlama tutmazsa metin olarak aranır (hata gösterilmez).
- Kitaba ISBN yalnızca kullanıcı ISBN ile aradıysa ya da elle yazdıysa kaydedilir. Open Library'nin bir esere ait `isbn` listesinden ISBN seçme: o liste bütün baskıları içerir.
- ISBN aramasında sonuç yoksa "Elle ekle" ISBN alanı dolu açılır.

## 5. Ekranlar

Adresler karma (hash) biçiminde, TripKit gibi.

### 5.1 Kitaplık — `#/` (`01`)

- Üst çubuk: BookKit işareti ve adı, çevrimiçi etiketi, Ayarlar düğmesi (yedek zamanı geldiyse amber nokta).
- Göz atma satırı (eyebrow): **"Bu yıl 7 kitap bitirdin"**. Maketteki "2026’da" yerine bu metin kullanılır: yıl eki yıla göre değişir (’da/’de/’ta), "Bu yıl" her yıl doğru. Sıfırsa satır yok.
- Başlık "Kitaplığın". Sekmeler: Okuyorum · Okumak istiyorum · Okudum, her birinde sayı. Seçili sekme adreste durur (`#/?tab=want`).
- Kitap kartları (kapak, ad, yazar, bilgi satırı, ok), kitap sayfasına gider. Bilgi satırı:
  - Okuyorum: "12 Eylül’de başladın · 3 not"
  - Okumak istiyorum: "Eklendi: 12 Eylül" (not varsa " · 1 not")
  - Okudum: "3 Ekim’de bitirdin" ve puan varsa küçük yıldız + sayı; bitirme tarihi yoksa "Bitirme tarihi yok"; yarım bırakılanda etiket "Yarım bıraktım" ve "3 Ekim’de bıraktın".
  - Başka yıldan tarihler bölüm 4.2'deki gibi eksiz ve yıllı.
- "Son notun" kartı (notu olan kitap varsa): tür etiketi, kitap adı, sayfa, tarih, metnin ilk 3 satırı; kitap sayfasına gider.
- Alttaki sabit ana düğme "Kitap ekle".
- Boş kitaplık: başlığın altında kısa karşılama (bölüm 9) ve "Kitap ekle". Boş sekme: sekmeye özel tek cümle (bölüm 9).

### 5.2 Kitap ekle — `#/add` (`02`)

- Geri düğmesi, başlık "Kitap ekle", arama alanı (açılışta odakta, temizleme düğmesi), altında ipucu.
- Arama: en az 2 karakter, 400 ms bekleme, yeni arama eskisini iptal eder (`AbortController`). Durumlar:
  - "Bulamadın mı? Elle ekle" bağlantısı her durumda görünür (sonuçların altında da, maketteki gibi).
  - 2 karakterden az: yalnızca ipucu.
  - Yükleniyor: 3 iskelet satır. Her istek 8 saniyede zaman aşımına uğrar (`AbortSignal.timeout`).
  - Sonuçlar: en fazla 20 satır (kapak ya da üretilen kapak, ad, yazar). Kitaplıkta olanlar soluk ve "Kitaplığında var" etiketli, seçilemez.
  - Sonuç yok, çevrimdışı, hata: bölüm 9'daki metin + "Elle ekle" düğmesi. İki kaynak varsa biri hata verince diğerinin sonuçları gösterilir.
- Bir sonuç seçilince (radyo seçimi) altta "Nereye eklensin?" (Okumak istiyorum varsayılan / Okuyorum / Okudum) ve sabit "Kitaplığa ekle".
- Ekleyince: kitap oluşur, kapak arka planda indirilir, bildirim "Huzur kitaplığa eklendi" + "Aç" (kitap sayfası). Ekran açık kalır, seçim temizlenir: art arda kitap eklenebilir.
- **Elle ekle** — `#/add/manual` (çizilmedi): "Kitabın adı" (zorunlu, aramadaki metinle dolu gelir; arama ISBN idiyse ad boş, ISBN dolu), "Yazar" (isteğe bağlı; ipucu "Birden fazla yazarı virgülle ayır"), "ISBN (isteğe bağlı)", durum seçimi ("Okudum"da isteğe bağlı bitirme tarihi), "Kitaplığa ekle". Geçersiz ISBN: "Bu ISBN geçerli görünmüyor." Kapak üretilir. Kaydedince kitap sayfası açılır (geçmişte `replace`), bildirim "{Ad} kitaplığa eklendi".

### 5.3 Kitap — `#/book/:id` (`03`)

- Geri, "…" menüsü: Düzenle, Sil (onay metinleri bölüm 9). Silince Kitaplık açılır, bildirim "Kitap silindi".
- Kitap yoksa (silinmiş, yanlış adres): TripKit'teki `Missing` ekranı, "Bu kitap bulunamadı.", Kitaplık'a dönüş.
- Kapak, ad, yazar(lar), durum etiketi, tarih satırı.
- Duruma göre eylemler:
  - `want`: "Okumaya başla" (tonal).
  - `reading`: "Bitirdim" (tonal) ve "Yarım bıraktım" (çerçeveli) — maketteki gibi.
  - `read`: eylem yok; tarih satırı "12 Eylül – 3 Ekim 2026".
  - `abandoned`: "Tekrar başla" (çerçeveli).
- Puan: 5 yıldız düğmesi. Yalnızca `read`'de etkin; aynı yıldıza yeniden dokununca puan silinir. Diğer durumlarda soluk ve ipucu "Bitirince puan verebilirsin".
- "Bitirdim"den sonra bildirim: "Bitirdin. İstersen puan ver."
- "Notlar ve alıntılar" + sayı, süzgeç çipleri Hepsi / Notlar / Alıntılar. Notlar maketteki gibi; alıntı büyük tırnak işaretiyle. Bir nota dokununca düzenleme penceresi açılır.
- Hiç not yoksa: "Okurken aklında kalanları, beğendiğin cümleleri buraya ekle." Süzgeçte boş kalırsa: "Bu kitapta henüz not yok." / "Bu kitapta henüz alıntı yok."
- Alttaki sabit "Not ekle".
- **Düzenle** — `#/book/:id/edit` (çizilmedi): ad, yazar(lar), ISBN, durum, başlama ve bitirme tarihi (tarih alanları), "Kaydet". Kurallar bölüm 4.2; hatalar alanın altında (bölüm 9).

### 5.4 Not ekle / düzenle (`04`)

- Kitap sayfasının üstünde alttan açılan `<dialog>` (TripKit'teki `NoteEditDialog` / `RestoreSheet` davranışı: Esc ve Android geri hareketi kapatır).
- Başlık "Not ekle" (düzenlerken "Notu düzenle"), altında kitap adı.
- Tür seçimi Not / Alıntı; metin alanı (zorunlu, açılışta odakta); "Sayfa (isteğe bağlı)" yalnızca rakam, 1–9999, dışındaysa "Sayfa 1 ile 9999 arasında olmalı."
- "Kaydet" metin boşken pasif; "Vazgeç". Düzenlerken ayrıca "Notu sil" (onaysız, bildirimle: "Not silindi").
- Kaydedince pencere kapanır, bildirim "Not eklendi".

### 5.5 Ayarlar — `#/settings`

`kit-template`'teki hazır Ayarlar ekranı: Yedek, Görünüm, Bu cihazda (Kitap, Not ve alıntı, Kapak, Kapladığı yer), Verileri sil, sürüm, "KitShelf ailesinden". Metinler bölüm 9.

## 6. Kitap arama ve kapaklar

### 6.1 Kaynaklar

30 Eylül 2026'da denendi:

- **Open Library** — `https://openlibrary.org/search.json?q=<metin>&fields=key,title,author_name,first_publish_year,isbn,cover_i,language&limit=20`. Anahtar istemiyor, `Access-Control-Allow-Origin: *`. "tanpınar" araması Türkçe kayıtlar döndürdü (Saatleri Ayarlama Enstitüsü, Huzur…). Ancak Türkçe baskıların bir kısmında kapak yoktu. Bazı kayıtlar tamamen büyük harf ya da bozuk kodlamalıydı (`Enstitï¿½sï¿½`). Dikkat: `search.json` **eserleri** döndürür, baskıları değil. Çeviri bir kitap özgün adıyla gelebilir ("Suç ve Ceza" yerine "Crime and Punishment"), `language`, `isbn` ve `cover_i` bütün baskılardan toplanır. Karşılaştırma betiğinde eşleşen baskıyı döndüren alanları da dene (`editions`, `editions.title`, `editions.language`, `editions.cover_i` gibi; çalıştığından emin değiliz). Türkçe baskı adı geliyorsa onu göster.
- **Open Library kapakları** — `https://covers.openlibrary.org/b/id/<cover_i>-M.jpg?default=false`. CORS açık, M boyutu yaklaşık 12 KB, yoksa 404 döner. Belgelerine göre kapak kimliğiyle (cover id) erişim sınırsız, ISBN ile erişim IP başına 5 dakikada 100 istekle sınırlı: **kapak kimliğini kullan**.
- **Google Books** — `https://www.googleapis.com/books/v1/volumes?q=<metin>&maxResults=20&printType=books`. Anahtarsız denemede `429 Quota exceeded` döndü (anahtarsız istekler ortak bir kotadan düşüyor). Kullanılacaksa **API anahtarı** gerekir. Tarayıcı anahtarı zaten herkese görünür; Google Cloud'da yalnızca `https://book.kitshelf.app/*` ve `http://localhost:*` adreslerine kısıtlanır. Anahtar yerelde `.env.local` içinde (git'e girmez), yayında GitHub Actions değişkeni olarak derleme adımına `VITE_GOOGLE_BOOKS_KEY`; yoksa bu kaynak hiç çağrılmaz. Adres kısıtlı anahtar Node betiğinde çalışmaz: karşılaştırma için Tolga ayrı, geçici bir anahtar açar ve sonra siler. Varsayılan günlük kota düşük: Google yalnızca Open Library 5'ten az sonuç verdiğinde ya da ISBN aramasında sorulur. Küçük resimlerin (`imageLinks.thumbnail`, `http` → `https`) CORS'u denenmedi.

### 6.2 Karşılaştırma ve karar

Aşama D'nin başında `scripts/compare-sources.mjs` yaz; Tolga'nın makinesinde Node ile çalışır, uygulamaya girmez. Sorgular:

- Kürk Mantolu Madonna — Sabahattin Ali
- Kuyucaklı Yusuf — Sabahattin Ali
- Saatleri Ayarlama Enstitüsü — Ahmet Hamdi Tanpınar
- Tutunamayanlar — Oğuz Atay
- Tehlikeli Oyunlar — Oğuz Atay
- İnce Memed — Yaşar Kemal
- Çalıkuşu — Reşat Nuri Güntekin
- Aşk-ı Memnu — Halit Ziya Uşaklıgil
- Yaban — Yakup Kadri Karaosmanoğlu
- Benim Adım Kırmızı — Orhan Pamuk
- Masumiyet Müzesi — Orhan Pamuk
- Serenad — Zülfü Livaneli
- Suç ve Ceza — Fyodor Dostoyevski
- Simyacı — Paulo Coelho
- Sapiens — Yuval Noah Harari
- Beyaz Diş — Jack London
- Yalnızca yazar adıyla: "sabahattin ali", "orhan pamuk"
- ISBN ile: Tolga'nın kendi kitaplarından 4 ISBN (sor)

Her kaynak ve sorgu için: doğru kitap ilk 5'te mi, Türkçe baskı var mı, kapak var mı, ISBN var mı. Sonucu `docs/search-sources.md` tablosuna yaz. Karar kuralı:

- Open Library sorguların en az %80'inde doğru kitabı ilk 5'te buluyorsa tek kaynak o olur.
- Bulamıyorsa Tolga'ya Google Books anahtarını sor. Anahtar gelince iki kaynağa paralel sorulur, sonuçlar ISBN ya da normalleştirilmiş ad + yazar ile tekilleştirilir, kapaklı sonuç öne alınır.

### 6.3 Sonuçları temizleme

- Bozuk kodlamalı kayıtları (`�`, `ï¿½` içeren) at.
- Tamamen büyük harfli adları Türkçe duyarlı biçimde düzelt ("SAATLERİ AYARLAMA ENSTİTÜSÜ" → "Saatleri Ayarlama Enstitüsü").
- Aynı ad + yazar tekrarlarını birleştir: kapaklı olanı tut, ISBN'leri birleştir.
- Cihaz dili Türkçeyse `language` alanında `tur` olan kayıtları öne al.

### 6.4 Kapakları saklama

- Kitap eklenince kapak `fetch` ile Blob olarak alınır ve `covers` deposuna yazılır; görüntüde `URL.createObjectURL` (bileşen kapanınca `revokeObjectURL`).
- 404 ise kapak yok demektir: `coverUrl` silinir, üretilen kapak kalır, yeniden denenmez. Ağ ya da CORS hatasında `coverUrl` durur; uygulama açılışında ve `online` olayında eksik kapaklar yeniden denenir.
- Kapak inince ekran kendiliğinden güncellenir (bellekteki veri yenilenir).
- Kitap silinince kapağı da silinir.
- Yedekten dönen kitapların eksik kapakları aynı yolla, internet varken sessizce indirilir.
- Nesne adreslerini (`createObjectURL`) bir `useEffect` içinde üret ve temizle; React StrictMode bileşeni iki kez bağlar.

### 6.5 Gizlilik

Aramada yalnızca yazılan metin kaynağa gider. Ayarlar'daki "Bu cihazda" kartının altına bir satır: "Kitap ararken yalnızca yazdığın metin Open Library’ye gider." (Google Books da kullanılırsa "Open Library’ye ve Google Books’a").

## 7. Yedekleme

`kitshelf-ui`'deki yedekleme çekirdeği, TripKit'teki gibi:

- `kit: 'bookkit'`, `kitName: 'BookKit'`, `dataVersion: 1`, `data: { books: Book[] }`.
- **Kapaklar yedeğe girmez** (dosya küçük kalsın). `coverUrl` girer; geri yüklemeden sonra eksik kapaklar internet varken indirilir, olmayanlar üretilen kapakla görünür.
- Özet sayıları: kitap, not, alıntı.
- Birleştirme kitap düzeyinde `updatedAt` ile (TripKit'teki kural ve sınırlar aynen: silmeler taşınmaz, aynı kitap iki cihazda değiştiyse yeni olan bütünüyle kalır).
- Değiştir: `books` temizlenir, yedektekiler yazılır. Kapaklardan yalnızca yedekte aynı kimlik ve aynı `coverUrl` ile kalan kitaplarınkiler tutulur, gerisi silinir (çevrimdışıyken kapak kaybolmasın).
- Hatırlatma ve kalıcı depolama TripKit'teki gibi; "veri var" = en az bir kitap.

## 8. Aşamalar

- **A — Depo ve iskelet:** şablondan depo; kit kimliği `bookkit`, ad `BookKit`, renkler (2.1), ikonlar (maskelenebilir ikon için `bookkit-maskable.svg`'yi kullan; TripKit'in betiği bunu köşe yuvarlaklığını silerek yapıyor, burada hazır dosya var), manifest (`name`/`short_name` "BookKit", `description` bölüm 9). Şablonun örnek verisi kaldırılır. Tasarım dosyaları `docs/design/bookkit/` altına. `deploy.yml` yalnızca elle. Geliştirme sunucusunda boş kitaplık açılıyor. **Dur.**
- **B — Veri:** tipler, veritabanı, migration iskeleti, bölüm 4.2'deki kurallar ve testleri (durum geçişleri, "bu yıl" sayımı ve yıl sınırı, sıralamalar, son not, ISBN doğrulama ve 10→13 çevirme, Türkçe normalleştirme, aynı kitap bulma, üretilen kapak renginin kararlılığı). **Dur.**
- **C — Ekranlar (arama hariç):** Kitaplık, Kitap, Not ekle/düzenle, Elle ekle, Düzenle; boş durumlar; üretilen kapaklar. Bu aşamada kitaplar yalnızca elle eklenir. **Dur.**
- **D — Arama ve kapaklar:** önce karşılaştırma betiği ve `docs/search-sources.md` (Tolga'yla kararı konuş), sonra arama ekranı, temizleme, kapak indirme ve saklama. Testler ağ kullanmaz, kaydedilmiş örnek yanıtlarla (fixture) çalışır. **Dur.**
- **E — Yedek ve Ayarlar:** bağdaştırıcı, Ayarlar ekranı, ana ekran hatırlatması, silme (IndexedDB, `bookkit-` anahtarları), kapakların geri yüklemeden sonra indirilmesi; testler. **Dur.**
- **F — Yayın:** `deploy.yml`'e `push` tetikleyicisini geri ekle. Tolga Cloudflare'de `CNAME book → tolgasenerhollypalm.github.io` ekler (proxy kapalı). Pages › Source: GitHub Actions, Custom domain `book.kitshelf.app`, Enforce HTTPS. Çevrimdışı kurulum denemesi, bölüm 10'daki telefon testleri, README. İstenirse TripKit'teki gibi Cloudflare Web Analytics (yeni site belirtecini Tolga verir; verilmezse ekleme). **Tolga "yayınla" deyince** `main`'e push.

## 9. Metinler

| Yer | Metin |
| --- | --- |
| Manifest açıklaması | Okuduğun kitaplar, notların ve alıntıların. Çevrimdışı, hesapsız. |
| Göz atma satırı | Bu yıl {n} kitap bitirdin |
| Başlık | Kitaplığın |
| Sekmeler | Okuyorum · Okumak istiyorum · Okudum |
| Boş kitaplık, başlık | Kitaplığın burada birikecek |
| Boş kitaplık, metin | Okuduğun, okumak istediğin ve bitirdiğin kitapları ekle. Okurken aldığın notlar ve alıntılar kitabın sayfasında durur. |
| Boş sekme: Okuyorum | Şu an okuduğun bir kitap yok. |
| Boş sekme: Okumak istiyorum | Okumak istediğin kitapları buraya ekle. |
| Boş sekme: Okudum | Bitirdiğin kitaplar burada birikir. |
| Son not bölümü | Son notun |
| Ana düğme | Kitap ekle |
| Arama alanı | Kitap adı, yazar ya da ISBN |
| Arama ipucu | Sonuçlar internetten geliyor; kapak ve bilgiler cihazına kaydedilir. |
| Elle ekleme bağlantısı | Bulamadın mı? Elle ekle |
| Sonuç yok | Sonuç yok. Yazımı kontrol et ya da kitabı elle ekle. |
| Çevrimdışı | İnternet yok. Kitabı elle ekleyebilirsin. |
| Arama hatası | Arama yapılamadı. Tekrar dene ya da kitabı elle ekle. |
| Kitaplıkta olan sonuç | Kitaplığında var |
| Durum seçimi başlığı | Nereye eklensin? |
| Ekle düğmesi | Kitaplığa ekle |
| Eklendi bildirimi | {Ad} kitaplığa eklendi · Aç |
| Elle ekle alanları | Kitabın adı · Yazar (Birden fazla yazarı virgülle ayır) · ISBN (isteğe bağlı) |
| Durum etiketleri | Okumak istiyorum · Okuyorum · Okudum · Yarım bıraktım |
| Eylemler | Okumaya başla · Bitirdim · Yarım bıraktım · Tekrar başla |
| Tarih satırları | 12 Eylül 2026’da başladın · 12 Eylül – 3 Ekim 2026 · 3 Ekim’de bıraktın |
| Puan | Puan · Bitirince puan verebilirsin |
| Bitirdim bildirimi | Bitirdin. İstersen puan ver. |
| Notlar başlığı / süzgeç | Notlar ve alıntılar · Hepsi · Notlar · Alıntılar |
| Not yok | Okurken aklında kalanları, beğendiğin cümleleri buraya ekle. |
| Not penceresi | Not ekle / Notu düzenle · Not · Alıntı · Sayfa (isteğe bağlı) · Kaydet · Vazgeç · Notu sil |
| Not bildirimleri | Not eklendi · Not silindi |
| Kitap silme onayı (notsuz) | Bu kitap silinsin mi? · Geri alınamaz. · Evet, sil |
| Kitap silme onayı (notlu) | Bu kitap ve notları silinsin mi? · {n} not ve alıntı da silinecek. Geri alınamaz. · Evet, sil |
| Silindi / bulunamadı | Kitap silindi · Bu kitap bulunamadı. |
| Tarih hataları | Bitirme tarihi başlama tarihinden önce olamaz. · İleri bir tarih seçilemez. |
| Okudum'a geri dönme onayı | Bitirme tarihi ve puan silinecek. · Evet, tekrar başla |
| Aynı kitap uyarısı | Kitaplığında aynı adlı bir kitap var. · Yine de ekle |
| Yedek kartı açıklaması | Kitapların ve notların yalnızca bu cihazda duruyor. Yedek dosyasını Drive’a, e-postana ya da kendine gönder; telefon değişirse buradan geri yüklersin. |
| Yedek hatırlatma | Henüz yedeğin yok / Son yedeğin {n} gün önce · Telefonun değişirse notların kaybolmasın. · Şimdi yedekle |
| Geri yükleme sayıları | {n} kitap · {m} not · {k} alıntı |
| Geri yükleme seçenekleri | Birleştir: Bu cihazda olmayan kitaplar eklenir. İkisinde de olan kitabın daha yeni hâli kalır. Hiçbir şey silinmez. · Değiştir: Bu cihazdaki kitaplar ve notlar silinir, yerine yedektekiler gelir. |
| Değiştir onayı | Bu cihazdaki kitaplar silinsin mi? · Bu cihazdaki {n} kitap ve {m} not silinecek, yerine yedekteki {x} kitap gelecek. Geri alınamaz. · Evet, değiştir |
| Geri yükleme bildirimleri | Geri yüklendi: {a} kitap eklendi, {u} kitap güncellendi. (sıfır olan kısım yazılmaz) · Yedekteki her şey bu cihazda zaten var. · Geri yüklendi: {x} kitap, {y} not. |
| Yedek hataları | Bu dosya bir KitShelf yedeği değil. · Bu bir {TripKit} yedeği. BookKit'e yalnızca BookKit yedekleri yüklenebilir. · Bu yedek BookKit'in daha yeni bir sürümüyle alınmış. Önce uygulamayı güncelle, sonra tekrar dene. · Yedek dosyası bozuk görünüyor. Hiçbir şey değiştirilmedi. |
| Silme onayı (Ayarlar) | Her şey silinsin mi? · {n} kitap, notları ve kapaklarıyla birlikte silinecek. + TripKit'teki yedek cümlesi · Evet, sil |
| Verileri sil metni | Bu cihazdaki her şeyi siler: kitaplar, notlar, alıntılar, kapaklar ve ayarlar. Geri alınamaz; silmeden önce yedek al. |
| Bu cihazda | Kitap · Not ve alıntı · Kapak · Kapladığı yer |

Burada olmayan yedek ve Ayarlar metinleri (Yedeği kaydet, Son yedek, kalıcı depolama…) 1. adımdaki TripKit metinleriyle aynı; içlerinde "seyahat" ya da "soru paketi" geçen her cümle yukarıdaki BookKit karşılığıyla değişir.

## 10. Doğrulama

Her aşamada: 360 px'te yatay kaydırma yok, metin taşmıyor; dokunma alanları ≥ 44 px; yazı kontrastı ≥ 4.5:1, ikon ve kenarlar ≥ 3:1 (iki temada da).

Aşama F'de telefonda (TripKit'te kullanılan HTTPS yolu ya da yayından hemen sonra):

1. Android Chrome ve iPhone Safari'de ana ekrana ekleniyor, uçak modunda açılıyor, kapaklar görünüyor.
2. Arama: bölüm 6.2'deki kitaplardan beşi aranıp ekleniyor, kapaklar iniyor. Çevrimdışıyken arama mesajı ve elle ekleme çalışıyor.
3. ISBN ile arama (tireli ve tiresiz).
4. Okumaya başla → Bitirdim → puan; Yarım bıraktım → Tekrar başla; sayaç ve sekmeler doğru.
5. Not ve alıntı ekle, düzenle, sil; süzgeç çalışıyor; Android geri hareketi pencereyi kapatıyor.
6. Yedek al, başka bir tarayıcıda geri yükle: kitaplar ve notlar geliyor, kapaklar internetle yeniden iniyor.
7. "Tüm verileri sil" her şeyi, kapaklar dahil siliyor.

## 11. Kapsam dışı

- Barkodla ISBN okuma (her tarayıcıda yok; sonraya).
- Kullanıcının kendi kapak fotoğrafı.
- Yıllık okuma hedefi, istatistikler, raflar ve etiketler.
- Sayfa ilerlemesi ("s. 120 / 480").
- Bir kitabı FreeTimeKit'e "bunu konuşalım" diye gönderme.
- kitshelf.app'teki BookKit kartının "Yakında"dan "Aç"a dönmesi (ayrıca yapılacak).
