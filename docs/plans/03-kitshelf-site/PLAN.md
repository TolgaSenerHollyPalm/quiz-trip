# kitshelf.app güncellemesi — BookKit yayında, iki kit yolda

Bu dosya Claude Code için çalışma talimatıdır. Depo: `~/MyProjects/kitshelf-site` (canlı adres `https://kitshelf.app`). Tek aşamalı küçük bir iş; sonunda dur, özet ve ekran görüntüleri ver, Tolga "yayınla" demeden push'lama.

Durum: TripKit (`https://trip.kitshelf.app`) ve **BookKit (`https://book.kitshelf.app`) yayında**; FreedomKit ve FreeTimeKit yakında.

## 0. Önce

- Deponun yapısını incele (sayfa tek bir `index.html` mi, bir şablon ve derleme betiği mi var) ve **o yapıyı koru**. Yazı tipleri, renkler, kart ve etiket sınıfları (`card`, `card-top`, `tag-live`, `tag-soon`, `checks`, `soon`, `slot`) zaten var; yenilerini onlardan türet.
- Canlı sayfa ile depodaki sayfanın aynı olduğunu kontrol et; farklıysa dur ve söyle.

## 1. Tanıtım cümleleri

Üç yerde (meta `description`, `og:description`, girişteki `.lead` paragrafı) yalnızca şu parça değişir, cümlelerin geri kalanı aynen kalır:

- "seyahatinden boş zamanına kadar" → "seyahatinden okuduğun kitaplara, birikiminden boş zamanına kadar"
- `og:description` büyük harfle başlıyor: "Seyahatinden boş zamanına kadar" → "Seyahatinden okuduğun kitaplara, birikiminden boş zamanına kadar"

## 2. "Raftaki kitler" bölümü

Sıra: **TripKit, BookKit, FreedomKit, FreeTimeKit, Sıradaki kit**. Başlık: "İki kit yayında,<br>yenileri yolda." (eskisi "Şimdilik bir kit yayında…").

- **BookKit kartı TripKit kartıyla aynı kalıpta, "Yayında":** 64 px ikon, ad, alt satırda `book.kitshelf.app`, `tag-live` "Yayında" etiketi, slogan, üç madde ve en altta "BookKit'i aç" düğmesi (`https://book.kitshelf.app`, TripKit'teki ok ikonuyla). Düğme BookKit renginde: zemin `#9B3D63`, yazı `#FFFFFF` (6.5:1), üstüne gelince `#7E2F50`. Mevcut `.btn-primary`'ye bir kit rengi değişkeni ekleyerek yap, yeni bir düğme stili yazma.
- **FreedomKit ve FreeTimeKit "Yakında" kartları** mevcut FreeTimeKit kartının kalıbında: 64 px ikon, ad, küçük alt başlık, "Yakında" etiketi, slogan, üç madde, en altta "Rafa çok yakında geliyor".
- İkonlar `icons/` klasöründeki SVG'ler, satır içi.

| | BookKit (yayında) | FreedomKit | FreeTimeKit |
| --- | --- | --- | --- |
| İkon | `icons/bookkit-icon.svg` | `icons/freedomkit-icon.svg` | `icons/freetimekit-icon.svg` (eski soru işaretli balonun yerine) |
| Alt satır | book.kitshelf.app | Birikim | Sohbet kartları |
| Slogan | Okuduklarını kaydet, altını çizdiklerini unutma. | Paran varsa korkmazsın. | Boş zamanın bilgiye dönüşsün. (aynı) |
| Madde 1 | Okuyorum, okumak istiyorum ve okudum rafları | Birikimin kaç ay özgürlük ediyor, gör | Günde 10 dakikalık sohbet kartları: kısa bilgi ve sorular |
| Madde 2 | Her kitaba kısa notlar ve alıntılar | Türk lirası, döviz ve altın, güncel fiyatla | Hafta sonu masası: arkadaşlarınla tartışma soruları |
| Madde 3 | Adıyla ya da ISBN ile ara; internet yoksa elle ekle | Kendi aylık giderin ya da “1 ay = 1 tam altın” | İlgi alanına göre öneriler; kendi konularını da ekle |
| Madde işareti (daire / tik) | `#F6E6EC` / `#7E2F50` | `#E3E7F6` / `#2F3D80` | mevcut (`#F3EBDB` / `#5B4A22`) |

- Tik ve daire kontrastları hesaplandı (hepsi ≥ 7:1).
- Yerleşim: 5 öğe. Mevcut CSS 3 sütun (geniş), 2 sütun (≤ 1099 px, Sıradaki kit tam genişlik) ve 1 sütun (≤ 719 px) veriyor; eşit yükseklik ve alttaki satırların hizası (`margin-top: auto`) zaten çalışıyor.
  - Geniş ekranda ikinci satırda üçüncü hücre boş kalmasın: ≥ 1100 px'te Sıradaki kit iki sütun kaplasın (`grid-column: span 2`).
  - Tablette 2 + 2 + tam genişlik Sıradaki kit olur; bu doğru.
- İkonlar TripKit'teki gibi `.card-top`'un doğrudan çocuğu olan satır içi SVG, `width="64" height="64"` ve `aria-hidden="true"` ile. SVG dosyalarında boyut yok, eklemen gerekiyor. Telefondaki `.card-top > svg` kuralı (56 px) böylece onlara da uygulanır.
- Mevcut `.tile` kullanan FreeTimeKit kartı diğerleri gibi gerçek ikona geçer.
- Kartların alt kısmı hizalı kalsın: TripKit ve BookKit'te düğme, diğerlerinde "Rafa çok yakında geliyor" satırı en altta.
- "“1 ay = 1 tam altın”" ifadesi satır sonunda bölünmesin: "soru-cevap" gibi `white-space: nowrap` bir `span` içine al.

## 3. Girişteki raf çizimi

- **BookKit kutusu eklenir** (iki çizimde de: `shelf-lg`, `shelf-sm`), TripKit'in hemen sağına, TripKit kutusunun kalıbında:
  - zemin `#9B3D63`, gölgesi bordo tonlu (TripKit'teki `shT` filtresi gibi, rengi `#7E2F50`);
  - mercan "Yayında" etiketi;
  - kitap çizimi (`icons/bookkit-icon.svg`'nin zeminsiz iç şekilleri, kırpılmış `viewBox` ile, yaklaşık `124 96 262 320`);
  - "BookKit" beyaz, `book.kitshelf.app` `#F6E6EC` (5.4:1).
  - Kutular yeniden yerleşir: soldan TripKit (en yüksek), BookKit, FreeTimeKit ("Yakında", daha kısa), Sıradaki kit. Raf tahtası ve ayaklar aynı; kutular raftan taşmasın, aralar eşit. Telefondaki çizimde yer darsa kutular orantılı küçülür, yazılar okunur kalır (en az 11 px).
- FreedomKit rafa eklenmez; raf bir kit yayına çıkınca büyür.
- FreeTimeKit kutusundaki soru işaretli balon çizimi (iki çizimde de: `shelf-lg`, `shelf-sm`) yeni ikonun iç şekilleriyle değişir: koyu balon `#1B1F1E`, açık balon `#FFF8EA`, üç koyu nokta (bkz. `icons/freetimekit-icon.svg`, zeminsiz hâli). Boyut ve konum mevcut çizimle aynı: iç içe `svg`'de balonları kapsayacak kırpılmış bir `viewBox` kullan (yaklaşık `108 118 318 300`; TripKit bavulu da böyle yapılmış).
- Open Graph görseli (`og.png`) eski balonu göstermeye devam eder; bu iş kapsamında değişmiyor.

## 4. Değişmeyenler

TripKit kartı, girişteki "TripKit'i dene" ve üstteki "TripKit'i aç" düğmeleri, "Her kitin özellikleri" bölümü (yedek cümlesi zaten var), Open Graph görseli, analiz betiği.

Alt bilgideki "Kitler" listesine TripKit'in altına `BookKit` bağlantısı (`https://book.kitshelf.app`) eklenir.

## 5. Kabul

- 360, 390, 768, 1280 px genişliklerde ekran görüntüleri; yatay kaydırma yok, metin taşmıyor, kartlar hizalı.
- Yazı kontrastı ≥ 4.5:1.
- HTML doğrulanıyor (kapanmamış etiket yok), ikon SVG'lerinde `aria-hidden="true"`.
- BookKit düğmesi ve alt bilgi bağlantısı `https://book.kitshelf.app`'i açıyor.
- Yayın: Tolga "yayınla" deyince commit ve push; ardından `https://kitshelf.app` üzerinde değişikliklerin göründüğünü kontrol et.

## 6. Sonraki güncellemeler (bu işte değil)

FreedomKit ya da FreeTimeKit yayına çıkınca BookKit'e bu işte yapılanın aynısı: kart "Yayında" ve "{Kit}'i aç" düğmesiyle, rafa kutusu, alt bilgiye bağlantı, başlıkta kit sayısı ("Üç kit yayında…"). Dört kit de yayına çıkınca sayfa bir bütün olarak gözden geçirilir (Open Graph görseli dahil).
