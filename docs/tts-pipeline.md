# TTS Boru Hattı — Bölme, Birleştirme ve Kalite Kontrol

Uzun metinleri tek ses dosyasına çevirirken **duyulan bozulmanın asıl kaynağı "ses
kalitesi" değildir.** Model aynı olduğu sürece tını sabit kalır. Bozulma üç yerden gelir:

| Risk | Neden olur | Ölçüm | Çözüm |
|---|---|---|---|
| **Seviye sıçraması** | Parçalar arası üretim/gain farkı | RMS dBFS, LUFS | Tek geçişte iki-aşamalı `loudnorm` |
| **Ritim kopması** | Her parçanın başında/sonunda değişken sessizlik (0.05 sn – 2 sn) | Süre farkı | Sessizlik kırp + sabit ~350 ms boşluk |
| **Prozodi yarım kalması** | Cümle ortasından kesme | Dikiş sonundaki karakter | Cümle-farkında bölme, karakter tavanı |

Dördüncü bir risk daha var ama ölçülemez: **stokastik performans farkı.** Bazı TTS
modelleri aynı metni iki kez okurken farklı vurgu/tonlama üretebilir. Bu yüzden
parçalar *aynı ses kimliği ve aynı parametrelerle* üretilmeli; yeniden üretim
gerekiyorsa yalnızca sorunlu parça üretilmeli, diğerlerine dokunulmamalı.

## Araçlar

```
tools/tts_split.py     metni cümle-farkında parçalara böler, manifest üretir
tools/tts_concat.py    parçaları kırp → aralık ekle → normalize → kodla + QC raporu
tests/test_tts_split.py bölücü birim testleri (kısaltma/sayı tuzakları dahil)
```

### 1. Bölme

```bash
python3 tools/tts_split.py \
    --text senaryo.txt --max-chars 1400 \
    --out build/run --json build/run/manifest.json
```

Kurallar:
- **Paragraf > cümle > virgül** önceliğiyle keser.
- `Dr.`, `Prof.`, `Örn.`, `vb.`, `T.C.` gibi kısaltmalardan **kesmez**.
- `3.5`, `1.000`, `24.11.2026` gibi sayı/tarihlerden **kesmez**.
- Tek cümle bile sınırı aşıyorsa virgül/noktalı virgülden böler.
- `--max-chars` gerçek API limitinden **en az %7 küçük** seçilmeli (1500 → 1400).

### 2. Üretim

Parçaları **paralel** üret. Aynı `voice_id`, aynı dil, aynı hız parametreleri.
Turlara bölünmen gerekiyorsa ilk turda parça 0..9, ikinci turda 10..19 üret;
ses kimliği oturum boyunca sabit kalır.

### 3. Birleştirme + QC

```bash
python3 tools/tts_concat.py \
    --in build/run/audio --out build/final.mp3 \
    --gap 0.35 --lufs -16 --report build/qc.json
```

Sıra: **sessizlik kırp → 350 ms boşluk → iki-aşamalı loudnorm → kodla**.

Dikkat: konuşmada **crossfade kullanılmaz.** Crossfade heceleri üst üste bindirir,
kelime başları yutulur. Dikişte boşluk bırakmak, dinleyicinin nefes olarak
algıladığı doğal bir duraklamadır.

### 4. Raporu okuma

```
✓ build/final.mp3  (13.7 sn)  ← 3 parça, 2 dikiş
  ses yüksekliği: -16.3 LUFS  (hedef -16.0 LUFS)
⚠ 1 dikişte seviye sıçraması > 6 dB:
   trim_p2.wav → trim_p3.wav: -27.26 / -18.11 dBFS (Δ9.15)
```

- **Δ > 6 dB** → kulağa net batar. O parçayı aynı parametrelerle **yeniden üret**.
- **3–6 dB** → sınırda. İstersen `--lufs` değerini koruyup parçayı tek başına
  `loudnorm` ile hizala, ama önce yeniden üretmeyi dene.
- **< 3 dB** → sorunsuz.

## Ölçülen referans değerler (bu repoda test edildi)

3 parçalı yapay test sinyali, 0.05–1.5 sn arası değişken baş sessizliği:

| Yöntem | Süre | LUFS | Dikiş sıçraması |
|---|---|---|---|
| Naif `concat` (işlem yok) | 18.0 sn | −22.1 | ölçülmedi |
| Trim + gap + iki-aşamalı loudnorm | 13.7 sn | **−16.3** | Δ ≤ 9.15 tespit edildi |
| Trim + gap + tek-aşamalı loudnorm | 13.7 sn | −13.3 ❌ | — |

**Sonuç:** Trim 1.9 sn gereksiz sessizlik attı (≈ %11 kısalma); iki-aşamalı
`loudnorm` hedefi 0.3 LU içinde tuttu, tek geçiş 2.7 LU saptı.
QC, bilerek bozuk üretilmiş parçayı (Δ9.15 dB) doğru şekilde işaretledi.

## YouTube hedef değerleri

- Bütünleşik yükseklik: **−14 LUFS** civarı (YouTube kendi normalize eder; −16 güvenli)
- True peak: **≤ −1.0 dBTP**
- Örnekleme: 48 kHz (video ile uyum için), mono yeterli

`--lufs -14` ile YouTube'a daha yakın çıkabilirsin.

## Sınırlar

- Tur başına **10 ses klipi** → ~14.000 karakter. Daha uzun metinlerde aynı ses
  kimliğiyle partiler halinde devam edilir; dikişler birleşmiş dosyada görünmez.
- Çağrı başına ~1.500 karakter (API limiti).
- Şarkı/melodi üretilemez; yalnızca konuşma.
