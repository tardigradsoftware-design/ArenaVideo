# e-Devlet Unutulan Para — Dikey Video Stil Dosyası (STIL.md)

## Boyut ve Kare Hızı
- Çözünürlük: **1080 × 1920** (9:16 dikey — Instagram Reels / TikTok / YouTube Shorts).
- Kare hızı: **30 fps**, toplam süre **25,2 saniye (756 kare)**.
- Güvenli alan: İçerik soldan/sağdan en az **90 px**, üstten **200 px**, alttan **370 px** içeride.

## Zemin ve Kartlar
- Zemin beyaz kâğıt (`#FFFFFF`), üstünde hafif çapraz kayan nokta deseni (`#D8DCE6`, 28 px aralık).
- Her kart beyaz (`#FFFFFF`), **7 px düz siyah kontur (`#0E0E10`)**, **30 px köşe yuvarlaklığı**.
- Kartların gölgesi bulanık değil: **14 px sağ-alta kaydırılmış düz siyah (`14px 14px 0px #0E0E10`)**.

## Renk
- Ana vurgu turuncu-kırmızı (`#FF4D2E`). **Bir sahnede yalnızca tek bir ana vurgu öğesi `#FF4D2E` olur.**
- İkincil etiket sarı (`#FCC033`), yazısı siyah (`#0E0E10`).
- Gri yalnızca ikincil açıklama ve iptal edilmiş bakiye bilgisi için (`#8B8E95`).

## Yazı
- Başlık, damga ve altyazılar: **Unbounded** (700 ve 900 kalınlık, `-0.04em` sıkı harf aralığı, Türkçe `latin-ext`).
- Tutarlar, T.C. maskesi, IBAN ve süre sayaçları: **JetBrains Mono** (700 kalınlık).
- Altyazı ekranın alt-ortasında (`y: 1250 px`), **iki kelime iki kelime**, o an konuşulan kelime `#FF4D2E` kutu içinde beyaz yazılı ve yaylanarak vurgulu.

## Hareket
- Kartlar yaylı girer (`spring`), hiçbir öğe düz doğrusal kaymaz.
- Önemli kelimelerde (`olmadığı`, `para`, `unutulan`, `zamanaşımına`, `yaz`, `göndereyim`) tam o kelimenin karesinde damga düşer ve **10 karelik ekran sarsıntısı** tetiklenir.
- Sahne geçişi: **7 karelik içe dalış (zoom + hafif bulanıklık)**.
- Ekranda 2 saniyeden uzun hareketsiz hiçbir öğe kalmaz; ilk kare (`0. kare`) dolu başlar.

## Karakter
- **Robot Tu** sağ altta (`x: 840, y: 1390`) durur. Gövdesi yoktur: sadece yüzen kafa ve iki yanında süzülen eller.
- Konuşurken ağzı `genlik.json` ses zarfına göre kare kare açılıp kapanır; her sahnede göz ifadesi ve el pozu değişir.

## Ses
- `public/ses.mp3` seslendirmesine kesim ya da boşluk eklenmez (`6. karede / 0,20 sn` başlar).
- `public/sfx_bed.wav` müzik yatağı konuşmanın altında sürekli kalır (`-22 dB`), hiç susmaz.
- Geçiş, damga ve tuş efektleri konuşmadan en az **14–16 dB kısık** çalar.
