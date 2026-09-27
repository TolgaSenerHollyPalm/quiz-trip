# TripKit yeni tema — uygulama talimatı

Bu dosya Claude Code için çalışma talimatıdır. Önce tamamını oku, sonra ekran görüntülerine bak, **Aşama A**'dan başla. Her aşamanın sonunda dur, özet ver, onay bekle (PLAN.md'deki kurallar geçerli).

## 0. Bu klasörde ne var

| Yol | İçerik |
| --- | --- |
| `THEME.md` | Bu talimat |
| `screens/*.png` | Onaylanmış tasarımın ekran görüntüleri (telefon, 390 px genişlik, 2x) |
| `html/*.html` | Aynı ekranların statik HTML kopyaları. Ölçü, renk ve metinlerin **kesin kaynağı**. |

`html/` dosyaları satır içi `style="…"` ile yazılmış maketlerdir (`<x-dc>` ve `<helmet>` tasarım aracının sarmalayıcılarıdır, yok say). Tarayıcıda yazı tipi olmadan açılırlar; görsel referans için `screens/` kullan. **Oradaki stilleri bileşenlere olduğu gibi kopyalama**; değerleri aşağıdaki tokenlara ve CSS Modules'a çevir. Bir değer hem burada hem HTML'de varsa ve çelişiyorsa bu dosya geçerlidir.

| Ekran | Görüntü | Uygulamadaki karşılığı |
| --- | --- | --- |
| Ana ekran | `01-ana-ekran.png` | `HomeScreen` |
| Gezi | `02-gezi.png` | `TripScreen` |
| Hazırlık listesi | `03-hazirlik-listesi.png` | `ChecklistScreen` |
| Almadan gelme | `04-almadan-gelme.png` | **yeni** |
| Tatmadan gelme | `05-tatmadan-gelme.png` | **yeni** |
| Bilgi yarışması (cevaplanmış soru) | `06-bilgi-yarismasi.png` | `PlayScreen` |
| Tasarım dili | `07-tasarim-dili.png` | tokenlar ve bileşenler |
| Gezi renkleri | `08-gezi-renkleri.png` | `tripTheme` |

## 1. Kapsam

- Yalnızca bu depo (`trip.kitshelf.app`). `kitshelf.app` ana sitesine dokunulmaz.
- Uygulama ikonu ve adı aynı kalır.
- İş mantığı, puanlama, paket senkronizasyonu değişmez. Değişen: görünüm, ekran yerleşimi ve iki yeni liste (bölüm 7).
- Degrade başlıklar, degrade butonlar, sayfa kenarındaki renkli parlamalar (`index.css`'teki `radial-gradient` arka planı) ve gezi tipine göre boyanan sayfa zemini **kaldırılır**.

## 2. Yazı tipleri

- Başlıklar ve büyük sayılar: **Bricolage Grotesque** (değişken, 500–800).
- Arayüz ve gövde: **Figtree** (değişken, 400–700).
- Yazı tipleri pakette gelir, dışarıdan (Google Fonts vb.) yüklenmez: `@fontsource-variable/bricolage-grotesque` ve `@fontsource-variable/figtree`. Kurmadan önce güncel sürümlerini ve dokümantasyonunu doğrula.
- Sadece **latin** ve **latin-ext** alt kümeleri gerekir (Türkçe karakterler: ç ö ü latin'de; ğ ş İ latin-ext'te; ı latin'de).
- **Çevrimdışı şart:** woff2 dosyaları service worker'ın precache listesine girmeli. `vite-plugin-pwa` varsayılanı woff2'yi kapsamayabilir; `workbox.globPatterns`'i buna göre ayarla ve uçak modunda yazı tiplerinin geldiğini test et.
- Yedek yığın: `ui-sans-serif, system-ui, sans-serif`.

## 3. Tokenlar

`src/index.css`'teki değişkenleri aşağıdaki değerlere çek. Mevcut isimler korunabilir; yeni olanları ekle. Kullanılmayan eski değişkenleri (ör. `--header-bg`, `--trip-button-*`) temizle.

### 3.1 Açık tema

| Değişken | Değer | Kullanım |
| --- | --- | --- |
| `--color-bg` | `#F7F5F0` | Sayfa zemini (sıcak kâğıt) |
| `--color-surface` | `#FFFFFF` | Kartlar |
| `--color-text` | `#1B1F1E` | Ana yazı |
| `--color-muted` | `#5E6562` | İkincil yazı, notlar |
| `--color-border` | `#E8E2D7` | Kart ve buton kenarı |
| `--color-divider` | `#F0EBE2` | Kart içi satır ayırıcı |
| `--color-chip` | `#EFEAE0` | Nötr etiket, ilerleme çubuğu zemini |
| `--color-sunken` | `#EDE8DE` | Sekme zemini, açıklama kutusu |
| `--color-check-border` | `#948C80` | Boş işaret kutusu kenarı (3.3:1) |
| `--color-chevron` | `#8C918E` | Satır sonu ok ikonu |
| `--color-primary` | `#0A7D76` | Ana buton, hazırlık listesi |
| `--color-primary-dark` | `#075F59` | Teal yazı, metin buton |
| `--color-primary-soft` | `#DDF1EE` | Teal karo ve etiket zemini |
| `--color-on-primary` | `#FFFFFF` | |
| `--color-coral` | `#FF6B57` | Almadan gelme ilerleme dolgusu |
| `--color-coral-strong` | `#D9493A` | Almadan gelme işaret dolgusu, ekle butonu |
| `--color-coral-soft` | `#FFE9E4` | Mercan karo zemini |
| `--color-coral-text` | `#B23A26` | Mercan yazı |
| `--color-amber` | `#F0B23F` | Tatmadan gelme ilerleme dolgusu, ekle butonu |
| `--color-amber-strong` | `#B97A0B` | Tatmadan gelme işaret dolgusu |
| `--color-amber-soft` | `#FBF0D6` | Amber karo zemini |
| `--color-amber-text` | `#8A5A0B` | Amber yazı |
| `--color-on-amber` | `#3A2A06` | Amber buton üstündeki ikon |
| `--color-success` | `#1E7A45` | Doğru cevap kenarı ve rozeti |
| `--color-success-bg` | `#E3F4E8` | Doğru cevap zemini |
| `--color-success-text` | `#14532D` | "Doğru! +1 puan" |
| `--color-online-bg` / `--color-online-text` | `#E2F3E8` / `#1E6B3C` | Çevrimiçi etiketi (nokta `#22A05A`) |
| `--color-danger` | mevcut değer kalır | Silme onayı |

| Ölçü | Değer |
| --- | --- |
| Kök yazı boyutu | **16 px** (eskisi 18 px). Uygulama `rem` kullanıyorsa tüm ölçüleri kontrol et. |
| `--tap-size` | **44 px** (eskisi 56). Yarışma şıkları 56 px kalır. |
| Sayfa kenar boşluğu | 20 px |
| Kartlar arası | 12 px · bölümler arası 28 px |
| Köşe | buton 999 px · kart 20 px · geri sayım kartı 24 px · karo 14 px · küçük karo 11–12 px |
| Gölge | Neredeyse yok. Ayrımı 1 px `--color-border` yapar. Sadece yapışkan alt buton ve öne çıkan gezi kartında hafif gölge. |

### 3.2 Yazı ölçeği

| Rol | Font | Boyut / kalınlık |
| --- | --- | --- |
| Sayfa başlığı | Bricolage | 30–32 px / 800, harf aralığı −0.035em |
| Geri sayım sayısı | Bricolage | 64–72 px / 800, −0.045em |
| Bölüm başlığı | Bricolage | 19 px / 700, −0.02em |
| Kart başlığı / soru metni | Bricolage | 18–22 px / 700 |
| Liste maddesi, gövde | Figtree | 16 px / 400–600 |
| Not, açıklama, alt satır | Figtree | 13–14 px / 400–600 |
| Etiket | Figtree | 12–13 px / 600–700 |

### 3.3 Karanlık tema (öneri — tasarımda çizilmedi)

Uygulama telefonun ayarını izlediği için gerekli. Değerler kontrast için hesaplandı; uyguladıktan sonra ekranlarda göz kontrolü yap.

| Değişken | Değer |
| --- | --- |
| `--color-bg` | `#111615` |
| `--color-surface` | `#1A201F` |
| `--color-text` | `#ECE8E0` |
| `--color-muted` | `#A6AEAA` |
| `--color-border` | `#2A3230` |
| `--color-divider` | `#232A28` |
| `--color-chip` / `--color-sunken` | `#262E2C` |
| `--color-check-border` | `#76807C` |
| `--color-primary` / `--color-on-primary` | `#2DD4BF` / `#05221F` |
| `--color-primary-soft` / teal yazı | `#10403C` / `#5EEAD4` |
| `--color-coral-strong` (dolgu) / tik rengi | `#FF8A75` / `#3A0E06` |
| `--color-coral-soft` / `--color-coral-text` | `#3B1E18` / `#FFB4A6` |
| `--color-amber-strong` (dolgu) / tik rengi | `#F0B23F` / `#2A1C00` |
| `--color-amber-soft` / `--color-amber-text` | `#3A2A0E` / `#F5C96A` |

## 4. Gezi renkleri (tatil tipine göre)

`tripTheme.module.css`'teki çok değişkenli setlerin yerine her tip için **üç değişken** kalır. Gezi rengi yalnızca **geri sayım kartında** (zemin, üstünde beyaz yazı), **ana ekrandaki öne çıkan gezi kartının üst kısmında** ve **tatil tipi etiketinde** (soft zemin + ink yazı) kullanılır. Sayfa zemini, başlık ve butonlar gezi rengini almaz. `Screen`'in `<html>`'e tema sınıfı ekleyen etkisi artık gerekmez.

| Tip | `--trip-color` (beyaz yazı kontrastı) | `--trip-soft` | `--trip-ink` | Karanlık: soft / ink |
| --- | --- | --- | --- | --- |
| Deniz (`beach`) | `#1A6E9E` (5.6) | `#DCEEF8` | `#155A82` | `#1A3745` / `#98BED3` |
| Eğlence (`fun`) | `#9A6A0E` (4.7) | `#FBF0D6` | `#8A5A0B` | `#40361A` / `#D2BC93` |
| Kış (`winter`) | `#47708A` (5.3) | `#E6EFF5` | `#3A5F76` | `#28383F` / `#ACBFCA` |
| Şehir (`city`) | `#8A5A37` (5.8) | `#F2EADF` | `#7A4E2F` | `#3C3126` / `#CAB5A5` |
| Doğa (`nature`) | `#2F6E3B` (6.2) | `#DDF0E0` | `#276131` | `#203727` / `#A1BEA7` |
| İş (`business`) | `#4A5B78` (6.9) | `#E4E9F3` | `#3F4E68` | `#28323A` / `#AEB5C2` |
| Diğer / tipsiz (`other`) | `#0A7D76` (5.0) | `#DDF1EE` | `#075F59` | `#153C39` / `#91C4C1` |

Karanlık temada `--trip-color` aynı kalır. Kart üstündeki bütün yazılar beyazdır.

## 5. Bileşenler

Mevcut `src/ui/` bileşenlerini bu kurallara göre yeniden stille; yeni gerekenleri ekle.

- **Screen / üst çubuk:** Degrade yok, zemin sayfa rengi. Solda 44 px yuvarlak ikon butonu (geri: beyaz, 1 px kenar). Sağda en fazla iki eylem (ikon butonu ya da metin buton "Düzenle"). **Sayfa başlığı üst çubukta değil**, altında büyük başlık olarak durur; isteğe bağlı alt satır (14 px soluk).
- **Butonlar:**
  - *Ana:* teal dolgu, beyaz yazı, 52–54 px, tam yuvarlak. Bir ekranda en fazla bir tane. Uzun ekranlarda alta yapışık (20 px kenar, 28 px alttan boşluk).
  - *İkincil:* beyaz, 1 px kenar, teal-dark yazı, 44 px.
  - *Metin:* zeminsiz, teal-dark yazı, 44 px dokunma alanı.
  - *İkon:* 44×44 yuvarlak, beyaz, 1 px kenar, `aria-label` zorunlu.
  - "Geziyi sil", "Oyun verilerini sıfırla", "Geziyi düzenle" artık alt alta buton değil; gezi ekranındaki **"…" menüsüne** taşınır. Mevcut `ConfirmDialog`'lar aynen kalır, sadece yeni stile uyar.
- **Liste kartı + satır:** Beyaz kart, 20 px köşe, 1 px kenar; satırlar arası `--color-divider` çizgisi, ikonun sağından başlar. Bağlantı satırı: 44 px renkli karo + başlık (16/600) + alt satır (13 px soluk) + sağda ok. Küçük varyant: 36 px karo, 15 px başlık.
- **İlerleme çubuğu:** Zemin `--color-chip`. Satır içinde 4 px, liste sayfalarında 8 px. Dolgu listenin rengi (teal / mercan / amber).
- **İşaret kutusu:** 24 px daire, 44 px dokunma alanı. Boş: 2 px `--color-check-border`. Dolu: listenin güçlü rengi + beyaz tik (hazırlık teal, almadan gelme `--color-coral-strong`, tatmadan gelme `--color-amber-strong`). `aria-label` maddeyi ve eylemi söyler ("Powerbank: işaretle").
- **Tamamlanan madde:** Soluk yazı, üstü çizili (çizgi rengi `#B7B0A3`). Tamamlananlar listenin altında, katlanabilir **"Tamamlananlar · n"** bölümünde durur.
- **Etiket (chip):** 28 px, tam yuvarlak, 13 px. Nötr: `--color-chip` zemin. Gün rozeti: gezi tipinin soft/ink'i ("57 gün"); bitmiş gezi: nötr ("Bitti").
- **Sekmeli seçici:** `--color-sunken` zemin, 14 px köşe, 4 px iç boşluk; seçili sekme beyaz ve hafif gölgeli, 40 px. Hazırlık listesinde Alınacaklar / Yapılacaklar.
- **Ekleme alanı:** Beyaz kart içinde metin kutusu + 44 px kare-yuvarlak ekle butonu (listenin rengi). Enter da ekler. Görünmez ama ekran okuyucunun okuduğu bir `<label>` olmalı.
- **Geri sayım kartı:** Gezi rengi zemin, 24 px köşe, 20 px iç boşluk. Solda büyük sayı, sağda "gün kaldı" (18/700) ve mevcut `countdownMessage` metni (14 px). Tarihsiz, bugün, gezi sırasında ve bitmiş hâller aynı kartta mevcut metinlerle.
- **Oyun karoları:** İki sütun. Bilgi yarışması koyu karo (`#1B1F1E` zemin, açık yazı, vurgu `#5EEAD4`); tahminler beyaz karo, bekleyen tahmin varsa mercan nokta + "n tahmin bekliyor".
- **İkonlar:** 24 px ızgarada çizgi ikonlar, 1.7–2 px kalınlık, yuvarlak uç. Emoji kullanılmaz. Gereken yeni ikonlar `html/` dosyalarında satır içi SVG olarak var (bavul, çanta, çatal-bıçak, konuşma balonu, hedef, kupa, kişiler, kutu, ok, tik, çarpı, yenile, saat).
- **Odak halkası:** 3 px, mevcut kural korunur.

## 6. Ekranlar

### 6.1 Ana ekran (`01`)
- Üst satır: ikon + "TripKit" (Bricolage 21/700), sağda çevrimiçi etiketi ve Ayarlar ikon butonu.
- "n gezi" (14 px soluk) + büyük başlık **"Gezilerin"**.
- **Öne çıkan gezi kartı:** `sortTrips` sırasında bitmemiş ilk gezi (yaklaşan ya da devam eden). Üst kısım gezi renginde: "Sıradaki gezi" etiketi, ulaşım ikonu, büyük gün sayısı + "gün kaldı" (gezi sırasında "Gezinin n. günü"), gezi adı, "tarih · ulaşım · tip". Alt kısım beyaz: üç sütun ilerleme (Hazırlık, Almadan gelme, Tatmadan gelme: "4 / 9" + 4 px çubuk). Bitmemiş gezi yoksa bu kart görünmez.
- **"Diğer geziler"** listesi: 44 px karo (gezi tipinin soft rengi + ulaşım ikonu), ad, "tarih · ulaşım · tip", sağda gün rozeti ya da "Bitti".
- Altta yapışık **"Yeni gezi"** ana butonu (artı ikonlu).
- Hiç gezi yoksa: mevcut karşılama metni (3 adım) aynı kart diliyle, altında "Yeni gezi".
- Sürüm bilgisi ana ekrandan kalkar, Ayarlar ekranına taşınır. iOS kurulum ipucu beyaz bir kart olur.

### 6.2 Gezi (`02`)
- Üst çubuk: geri + "…" menüsü (Geziyi düzenle, Gezi ayarları — parametreli şablon varsa, Oyun verilerini sıfırla — oynanmışsa, Geziyi sil).
- Etiketler: tatil tipi (gezi soft/ink, tip ikonu) + ulaşım (nötr). Başlık: gezi adı. Alt satır: "14 – 21 Ekim 2026 · 8 gün" (tarih yoksa gizli).
- Geri sayım kartı.
- **Listeler** kartı: Hazırlık listesi (teal, bavul), Almadan gelme (mercan, çanta), Tatmadan gelme (amber, çatal-bıçak). Her satırda "yapılan / toplam" ve 4 px ilerleme. Liste boşsa sayı yerine "Ekle" yazar, çubuk gizlenir.
- **Oyunlar** (paket varsa): başlığın sağında "n soru · n oyuncu".
  - Bilgi yarışması karosu: tur yoksa "Tura başla" (oyuncu yoksa önce oyuncu ekranına gider — mevcut mantık); yarım tur varsa "Tura devam et · 5 / 12". Turu iptal etme "…" menüsüne ya da oyun ekranına taşınır.
  - Tahminler karosu.
  - Altında satırlar: Skor tablosu ("Deniz önde · 14 puan"; eşitlikte "Berabere"; hiç tur yoksa "Henüz oynanmadı"), Oyuncular (isimler; tur sürerken kilitli olduğu alt satırda yazar), Soru paketleri (paket başlıkları).
- Paket yoksa Oyunlar bölümü yerine mevcut uyarı metni bir kart içinde + "Soru paketleri" satırı.

### 6.3 Hazırlık listesi (`03`)
- Başlık + alt satır: ulaşım ve tatil tipinden ("Uçak ve deniz tatiline göre önerildi"; seçim yoksa "Kendi listen").
- İlerleme kartı: büyük "4" + "/ 9 tamam", sağda yüzde, 8 px çubuk.
- Sekmeler: "Alınacaklar · n" / "Yapılacaklar · n" (açık madde sayısı).
- Açık maddeler; her maddenin altında önerinin kaynağı (Genel, Uçak, Araba, Otobüs, Vapur, Deniz, Eğlence, Kış, Şehir, Doğa, İş). Kullanıcının yazdığı maddede kaynak satırı yok.
- Kartın son satırı ekleme alanı: "Madde ekle, ör. fotoğraf makinesi" / Yapılacaklar'da "Madde ekle, ör. komşuya anahtar".
- "Tamamlananlar · n" katlanabilir bölüm (seçili sekmenin).
- Sağ üstte **"Düzenle"**: satırlarda silme butonu (44 px, `aria-label="Sil: …"`) belirir, buton "Bitti" olur. Normal modda satırlarda × yok.
- En altta ikincil **"Önerileri yenile"** + mevcut açıklama metni ("Öneriler ulaşım türüne ve tatil tarzına göre gelir. İşaretlediğin ve kendi yazdığın maddeler yerinde kalır.").

### 6.4 Almadan gelme (`04`) ve Tatmadan gelme (`05`)
Bkz. bölüm 7. Yerleşim ikisinde aynı, renk ve metin farklı:
- Başlık satırı: 52 px karo (ikon) + başlık + alt satır.
- İlerleme: 8 px çubuk + sağda "2 / 6 alındı" / "1 / 7 tadıldı".
- Ekleme alanı başlığın hemen altında (liste kullanıcıya ait, en sık eylem ekleme).
- Açık maddeler: kalın ad (16/600) + isteğe bağlı not (13 px soluk).
- "Alındı · n" / "Tadıldı · n" katlanabilir bölümü.
- "Düzenle" modu hazırlık listesindeki gibi. Maddeye dokununca ad ve not düzenlenir (satır içi ya da alttan açılan küçük panel; hangisi mevcut koda uygunsa).

### 6.5 Bilgi yarışması (`06`)
- Üst çubuk: × (gezi ekranına döner, tur kaydedilmiş kalır — mevcut davranış), ortada "Soru n / N", sağda süre açıksa geri sayan süre etiketi. Altında 4 px ilerleme.
- Oyuncu satırı: baş harfli avatar, "Sıra Deniz’de", diğer oyuncuların puanları, sağda kendi puanı (koyu etiket).
- Soru kartı: kategori etiketi (teal soft) + "Kolay · 1 puan", soru metni Bricolage 22/700.
- Şıklar: 56 px, A–D harf rozetli. Cevap sonrası: doğru şık yeşil (kenar `--color-success`, zemin `--color-success-bg`, tik). Yanlış seçilen şık mercan (zemin `--color-coral-soft`, kenar `--color-coral-strong`, çarpı); doğru şık yine yeşil gösterilir. Diğerleri soluk.
- Açıklama kutusu (`--color-sunken`): "Doğru! +n puan" / "Yanlış" / "Süre doldu" + açıklama metni.
- Altta ana buton: "Sıradaki: Ada" / son soruda "Turu bitir".
- Çizilmeyen **"Telefonu ver" ara ekranı** (sıradaki oyuncunun adı büyük → "Hazırım"): ortada 72 px avatar, "Telefonu Ada’ya ver" (Bricolage 26/800), altta ana buton "Hazırım".

### 6.6 Çizilmeyen diğer ekranlar
Gezi sihirbazı, gezi düzenleme, oyuncular, yarışma ayarları, tur sonucu, skor tablosu, tahminler (liste, detay, tahmin girişi, sonuç, yeni tahmin), soru paketleri, gezi ayarları, uygulama ayarları: **aynı bileşenlerle** yeniden stillenir.
- Büyük başlık, beyaz liste kartları, en fazla bir ana buton (gerekirse alta yapışık).
- Form alanı: 48 px, 14 px köşe, 1 px kenar, etiket üstte (14/600). Odakta teal halka.
- `ChoiceGroup` (ulaşım, tatil tipi, zorluk): 2–3 sütunlu seçilebilir karolar; seçili karo teal kenar + teal soft zemin, tatil tipinde ikon.
- Sıralama/skor listeleri: satır başında sıra numarası, birinci için kupa ikonu; puanlar sağda, `tabular-nums`.

## 7. Yeni özellik: "Almadan gelme" ve "Tatmadan gelme"

Kullanıcının kendi eklediği iki liste. Öneri gelmez, kendi başına doldurulur.

### 7.1 Veri
```ts
// src/trips/types.ts
export interface NoteItem {
  id: string
  text: string
  note?: string   // "Eski Pazar'da bakılacak", "Otel kahvaltısında"
  done: boolean
}

// TripState'e eklenir
souvenirs: NoteItem[] // Almadan gelme
tastes: NoteItem[]    // Tatmadan gelme
```
- Eski kayıtlarda bu alanlar yok: yüklerken `[]` olarak tamamla. Mevcut migration düzenine uy; gerekiyorsa veritabanı sürümünü artır. Migration testi ekle.
- "Oyun verilerini sıfırla" bu listeleri **silmez** (hazırlık listesi gibi gezi verisidir). Onay metnini güncelle: "Gezinin adı, tarihleri ve listeleri kalır."
- Gezi silinince listeler de gider (ayrı iş gerekmez).

### 7.2 Rotalar
`#/trip/:id/souvenirs` ve `#/trip/:id/tastes`. `router.ts` (`Route`, `href`, `parseRoute`) ve testleri güncellenir.

### 7.3 Davranış
- Ekle: boşluklar kırpılır, boş metin eklenmez, Enter ekler, alan temizlenir ve odakta kalır.
- İşaretle / işareti kaldır. İşaretlenen madde "Alındı" / "Tadıldı" bölümüne iner.
- Düzenle: ad ve not değiştirilebilir; not boş bırakılırsa kaldırılır.
- Sil: sadece "Düzenle" modunda.
- Sayılar ana ekrandaki öne çıkan gezi kartında ve gezi ekranındaki Listeler kartında görünür.
- Saf fonksiyonlar (ekle, işaretle, düzenle, sil) `src/trips/` altında, birim testleriyle.

### 7.4 Metinler
| | Almadan gelme | Tatmadan gelme |
| --- | --- | --- |
| Başlık | Almadan gelme | Tatmadan gelme |
| Alt satır | Eve dönmeden alınacaklar | Mutlaka denenecek tatlar |
| Ekleme alanı | Ne almak istiyorsun? | Ne tatmak istiyorsun? |
| İlerleme | n / m alındı | n / m tadıldı |
| Tamamlanan bölüm | Alındı · n | Tadıldı · n |
| Not alanı | Not (isteğe bağlı), ör. nereden, kime | Not (isteğe bağlı), ör. nerede, nasıldı |
| Boş liste | Hediyelik, baharat, tekstil… Eve götürmek istediklerini yaz. | Yöresel yemekler, tatlılar, içecekler… Tattıkça işaretle. |
| İkon / renk | çanta · mercan | çatal-bıçak · amber |

## 8. Aşamalar ve kabul kriterleri

Her aşama sonunda: testler, `build`, 390 px ve 360 px genişlikte ekran görüntüsü alıp `screens/` ile karşılaştır, commit, kısa özet, **dur**.

- **A — Temel:** yazı tipleri (çevrimdışı dahil), tokenlar (açık tema), gezi renkleri, `Screen`, butonlar, liste kartı/satırı, işaret kutusu, ilerleme çubuğu, etiket, ekleme alanı, katlanabilir bölüm, "…" menüsü. Degradeler ve parlama arka planı kalkar.
- **B — Ana ekran ve gezi ekranı.**
- **C — Hazırlık listesi** (sekmeler, Tamamlananlar, Düzenle modu).
- **D — Almadan gelme / Tatmadan gelme:** veri, migration, rotalar, ekranlar, testler.
- **E — Bilgi yarışması, "Telefonu ver" ara ekranı ve diğer ekranlar** (bölüm 6.6).
- **F — Karanlık tema** ve son geçiş.

Kabul:
- 360 px genişlikte yatay kaydırma yok; hiçbir metin taşmıyor.
- Tüm dokunma alanları en az 44 px.
- Yazı kontrastı en az 4.5:1, ikon ve kenarlar en az 3:1 (açık ve karanlık temada).
- Uçak modunda yazı tipleri dahil her şey açılıyor.
- Mevcut testler geçiyor; yeni listeler, migration ve rotalar için testler eklendi.
- `pwa-manifest.ts` ve `index.html`'deki `theme-color` yeni zeminle uyumlu (açık `#F7F5F0`, karanlık `#111615`) ve `pwa-manifest.test.ts` buna göre güncel.
