# DEVIR NOTLARI (DEVİR.md)

Bu dosya, projenin Drive'daki yedeğinden çalışma alanına geri kurulması sırasında
yapılanları ve bu ortamın (sandbox) kendine özgü kurulumunu anlatır.

## Ne geri yüklendi?

Drive klasörü `1_u8Fg0q69JMy5OlPyZWo7MNRsfLqpWBx` içindeki `edevlet-para-reel/`
projesi birebir çalışma alanına alındı:

| Yol | İçerik |
| :-- | :-- |
| `src/` | `Root.tsx`, `Composition.tsx` (EdevletParaReel), `AidatVideo.tsx` (AidatReel), `zamanlama.ts`, `tema.ts`, `kelimeler.json`, `genlik.json`, `aidat_*` dosyaları |
| `src/bilesenler/Ortak.tsx` | `NoktaliZemin`, `Altyazi`, `RobotTu`, `Damga`, `UstEtiket` |
| `src/sahneler/` | 6 sahne bileşeni (Hook → Rehber/CTA) |
| `public/` | `ses.mp3`, `sfx_bed.wav`, `aidat_ses.mp3`, `aidat_sfx.wav` (orijinal seslendirme ve efekt yatakları) |
| `ciktilar/` | Yayına hazır iki reels mp4'ü, kapak görselleri, açıklama / ilk yorum / DM metinleri |
| `.claude/skills/` | 13 Remotion skill'i (remotion-best-practices, -create, -render, -captions, -markup, -studio, -docs, -maps, -multimedia, -upgrade, -interactivity, -saas, -license) |
| kök | `package.json`, `package-lock.json`, `tsconfig.json`, `remotion.config.ts`, `eslint.config.mjs`, `.prettierrc`, `.gitignore`, `README.md`, `STIL.md`, `SAHNE_PLANI.md` |

`.claude/skills/` içeriği `remotion-dev/skills` deposunun güncel hâliyle birebir
karşılaştırıldı (`SKILL.md`, `audio.md` vb. fark yok), oradan yeniden kuruldu.

Drive'daki `.git` klasörü eksik geldi (`config`, `refs` yok) ve proje geçmişi
taşınmadı; bu depo kendi commit geçmişiyle ilerler.

## Ortam kurulumu (nerede ne değişti?)

Sandbox'ta yalnızca npm/PyPI/GitHub'a çıkış var; `remotion.media`, `fonts.gstatic.com`
gibi adresler kapalı. Bu yüzden:

1. **Headless Chromium:** `npx remotion browser ensure` indiremiyor. Tarayıcı
   `@sparticuz/chromium` paketinden çıkarılıyor, gereken `.so` kütüphaneleri aynı
   paketin `al2023.tar.br` dosyasından `.chrome/lib` altına açılıyor.
   → `npm run setup` (veya otomatik olarak her render çağrısında) yapılır.
   Chromium yolu ve `LD_LIBRARY_PATH` işini `scripts/chrome.mjs` +
   `scripts/remotion-komut.mjs` üstlenir.
2. **Fontlar:** `@remotion/google-fonts` CDN'e çıkmaya çalışıp render'ı
   30 sn timeout'a düşürüyordu. Fontlar `public/fonts` altına yerelleştirildi
   (`@fontsource/unbounded`, `@fontsource/jetbrains-mono`, latin + latin-ext
   alt kümeleri) ve `src/tema.ts` artık `@remotion/fonts`'in `loadFont()`'u ile
   `staticFile()` üzerinden yüklüyor.
3. **Emoji:** Chromium sistem fontlarında emoji yok; metinlerdeki 🔔 ⏳ 📩 👇 gibi
   karakterler boş kutu çıkıyordu. `Noto Color Emoji` (COLR/CPAL — Chromium'un
   renkli emoji desteği) `src/emoji-font.ts` ile Unbounded ve JetBrains Mono
   ailelerine `unicode-range` üzerinden bağlandı. Font 25 MB olduğu için repoda
   tutulmaz; `npm install` sonrası `scripts/fontlar.mjs` kopyalar.
   (Not: `@fontsource/noto-color-emoji` SVG tablosu kullanıyor ve Chromium bunu
   desteklemiyor — bu yüzden kullanılmadı.)
4. **Kök font tanımı:** İkon kutuları gibi `fontFamily` belirtilmemiş alanlar
   varsayılan serif fonta düşüp emoji yedeğini kaybediyordu. `Composition.tsx` ve
   `AidatVideo.tsx` kök `AbsoluteFill`'larına `fontFamily: FONT_BASLIK` eklendi.
   Görselde başka bir değişiklik yapılmadı.

## Komutlar

```bash
npm install          # bağımlılıklar + emoji fontu kopyalama (postinstall)
npm run setup        # emoji fontu + Chromium/kütüphaneleri hazırla
npm run dev          # Remotion Studio (canlı önizleme, port 3000)
npm run lint         # eslint + tsc
npm run kare -- EdevletParaReel kare.png --frame=60   # tek kare PNG
npm run render:edevlet                                # ciktilar/edevlet-unutulan-para-reel.mp4
npm run render:aidat                                  # ciktilar/fahis-aidat-itiraz-reel.mp4
npm run render -- AidatReel /tmp/test.mp4 --frames=0-89  # serbest render
```

Üç kompozisyon: `EdevletParaReel` (756 kare / 25,2 sn), `AidatReel`
(654 kare / 21,8 sn) ve `FahisAidatItiraz` (612 kare / 20,4 sn). Stil kuralları `STIL.md`, sahne tablosu ve paylaşım
metinleri `SAHNE_PLANI.md` içinde.

## Durum

- `npx tsc --noEmit` ve `npm run lint` temiz.
- Kare kontrolleri yapıldı (Hook, kalemler, rehber/CTA ve Aidat sahneleri):
  Türkçe glifler (ı, ğ, ş, İ), ₺ tutarlar ve emoji ikonları doğru çiziliyor.
- Uçtan uca mp4 render'ı doğrulandı (kodlama, ses, 90 karelik test kesiti).
- `public/` altındaki seslendirme ve efekt dosyaları **orijinal**; yeni bir video
  üretilirse senaryo + seslendirme + `kelimeler.json` / `genlik.json` /
  `zamanlama.ts` (kelime zamanlamaları) yeniden üretilmeli.

## Fahiş aidat kısa reels'i (`FahisAidatItiraz`)

Senaryo: "aidatlar kirayla yarışıyorsa yönetim kafasına göre belirleyemez;
KMK'ya göre işletme projesine itiraz ve demirbaş giderlerini ev sahibine
yansıtma hakkı var; yorumlara AİDAT yaz."

| Dosya | İçerik |
| :-- | :-- |
| `src/aidat2/zamanlama.ts` | Kelime kareleri (`an()`), sahne sınırları, sarsıntı ve yay yardımcıları |
| `src/aidat2/sahneler.tsx` | 5 sahne: Hook (kira/aidat yarışı) → Yönetim → 1. Hak → 2. Hak → CTA |
| `src/aidat2/video.tsx` | Kompozisyon kökü (altyazı, Robot Tu, sesler) |
| `src/aidat2/kelimeler.json` | Kelime başlangıç/bitiş saniyeleri |
| `src/aidat2/genlik.json` | 30 fps ses zarfı (Robot Tu ağzı) |
| `public/aidat2_ses.wav` | Seslendirme (18,57 sn konuşma + esler, 6. karede başlar) |
| `public/aidat_sfx.wav` | Müzik yatağı (mevcut dosya yeniden kullanıldı) |
| `ciktilar/fahis-aidat-itiraz-kisa-reel.mp4` | Render çıktısı (20,42 sn) |
| `ciktilar/fahis-kisa-aciklama.txt`, `fahis-kisa-ilk-yorum.txt` | Paylaşım metinleri (DM metni: `aidat-dm.txt`) |

Seslendirme + zamanlama üretimi tek komutla yeniden yapılabilir:

```bash
# cümle cümle TTS dosyaları /tmp/tts/01.mp3 ... 05.mp3 olarak üretildikten sonra
python3 scripts/ses-hazirla.py
```

`ses-hazirla.py` cümleleri kırpıp aralarına es koyarak birleştirir, kelime
sınırlarını hece ağırlığıyla dağıtıp sesin enerji çukurlarına yapıştırır ve
`kelimeler.json` + `genlik.json` dosyalarını yazar. Yeni bir reels için
`CUMS`, `ARALAR`, `TOPLAM_KARE` ve `SES_ON_EK` değerlerini değiştirmek yeterli.

Notlar:
- Altyazı şeridi ve Robot Tu artık parametrik: `src/bilesenler/Altyazi.tsx` ve
  `src/bilesenler/Robot.tsx`. `Ortak.tsx` bunları e-devlet reels'i için sarmalar;
  mevcut iki video bu değişiklikten etkilenmez.
- Sahneler `Sequence` içinde çalıştığı için kelime kilitleri `baslangic` prop'u
  ile global kareye çevrilir (`frame = yerelKare + baslangic`); damgalara
  `mevcutKare={frame}` verilir.
