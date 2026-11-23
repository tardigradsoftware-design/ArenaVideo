#!/usr/bin/env python3
"""Senaryo -> seslendirme zamanlaması + ses zarfı üreteci.

Girdi: /tmp/tts/NN.mp3 (cümle cümle üretilmiş seslendirme dosyaları, sırayla)
Çıktı: public/<onek>_ses.wav, src/<hedef>/kelimeler.json, src/<hedef>/genlik.json

Kelime sınırları önce cümle içinde hece ağırlığına göre dağıtılır, sonra
sesin 10 ms'lik enerji zarfındaki yerel çukurlara (±120 ms) yapıştırılır.
Böylece ekrandaki kelime vurguları gerçek konuşmayla hizalanır.

Kullanım:
    python3 scripts/ses-hazirla.py
"""
import json
import math
import os
import struct
import wave

import miniaudio

# ---------------------------------------------------------------- ayarlar
FPS = 30
ILK = 6                     # ses 6. karede (0.20 sn) başlar
TOPLAM_KARE = 612           # 20.40 sn
SES_ON_EK = "aidat2"        # public/aidat2_ses.wav
HEDEF_DIZIN = "src/aidat2"  # kelimeler.json + genlik.json
TTS_DIZIN = "/tmp/tts"
ARALAR = [0.18, 0.35, 0.14, 0.50]  # cümleler arası esler (sn)
HEDEF_RMS_DB = -19.5               # her cümle aynı ses seviyesine getirilir

CUMS = [
    "Oturduğun sitede aidatlar kirayla yarışır hale geldiyse",
    "yönetim bunu kafasına göre belirleyemez.",
    "Kat Mülkiyeti Kanunu'na göre hem işletme projesine itiraz etme",
    "hem de binanın demirbaş giderlerini ev sahibine yansıtma hakkın var.",
    "Yorumlara AİDAT yaz, fahiş aidata itiraz rehberini hemen göndereyim.",
]
# ------------------------------------------------------------- ayarlar sonu

SR, NCH = 44100, 2
SESLI = set("aeıioöuüAEIİOÖUÜ")


def kirp(d):
    """Baş/son sessizliği 20 ms'lik RMS pencereleriyle kırpar."""
    s, nch, sr = d.samples, d.nchannels, d.sample_rate
    w = int(sr * 0.02) * nch
    pen = [
        math.sqrt(sum(v * v for v in s[j:j + w]) / len(s[j:j + w]))
        for j in range(0, len(s) - w, w)
    ]
    esik = max(pen) * 0.06
    aktif = [k for k, p in enumerate(pen) if p > esik]
    return s[aktif[0] * w:(aktif[-1] + 1) * w]


def ses_esitle(pcm, hedef_db=HEDEF_RMS_DB):
    """TTS klipleri arasındaki seviye farkını giderir (tepe sınırı korunarak)."""
    rms = math.sqrt(sum(v * v for v in pcm) / len(pcm)) or 1
    hedef = (10 ** (hedef_db / 20)) * 32768
    kazanc = hedef / rms
    tepe = max(abs(v) for v in pcm) or 1
    if tepe * kazanc > 32000:
        kazanc = 32000 / tepe
    return [max(-32768, min(32767, int(v * kazanc))) for v in pcm], kazanc


def hece(kelime):
    return max(1, sum(1 for c in kelime if c in SESLI))


def enerji_zarf(pcm, pencere_ms=10):
    """10 ms'lik RMS dizisi."""
    adim = int(SR * pencere_ms / 1000) * NCH
    out = []
    for j in range(0, len(pcm) - adim, adim):
        p = pcm[j:j + adim]
        out.append(math.sqrt(sum(v * v for v in p) / len(p)))
    return out


def cukura_yapistir(zarf, t, tolerans=0.12):
    """t anına en yakın yerel enerji çukurunu döndürür."""
    adim = 0.010
    merkez = int(t / adim)
    yaricap = int(tolerans / adim)
    lo, hi = max(1, merkez - yaricap), min(len(zarf) - 2, merkez + yaricap)
    if hi <= lo:
        return t
    en_iyi, en_iyi_v = merkez, zarf[min(merkez, len(zarf) - 1)]
    for i in range(lo, hi):
        ortalama = (zarf[i - 1] + zarf[i] + zarf[i + 1]) / 3
        if ortalama < en_iyi_v * 0.85 and ortalama < (zarf[i - 1] + zarf[i + 1]) / 2:
            en_iyi, en_iyi_v = i, ortalama
    return en_iyi * adim


def main():
    parcalar = []
    for i in range(1, len(CUMS) + 1):
        p = kirp(miniaudio.decode_file(os.path.join(TTS_DIZIN, f"{i:02d}.mp3")))
        p, kazanc = ses_esitle(p)
        print(f"  cümle {i:02d}: seviye düzeltmesi x{kazanc:.2f}")
        parcalar.append(p)
    sureler = [len(p) / NCH / SR for p in parcalar]

    hedef = (TOPLAM_KARE - ILK) / FPS
    pcm, baslangiclar, t = [], [], 0.0
    for i, p in enumerate(parcalar):
        baslangiclar.append(t)
        pcm.extend(p)
        t += sureler[i]
        if i < len(parcalar) - 1:
            pcm.extend([0] * (int(ARALAR[i] * SR) * NCH))
            t += ARALAR[i]
    ses_sure = t
    pcm.extend([0] * (int(hedef * SR) * NCH - len(pcm)))

    os.makedirs("public", exist_ok=True)
    with wave.open(f"public/{SES_ON_EK}_ses.wav", "wb") as w:
        w.setnchannels(NCH)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(
            struct.pack("<%dh" % len(pcm), *[max(-32768, min(32767, v)) for v in pcm])
        )

    # --- kelime zamanlamaları: hece ağırlığı + enerji çukuruna yapıştırma
    zarf = enerji_zarf(pcm)
    kelimeler = []
    for i, cumle in enumerate(CUMS):
        toklar = cumle.split()
        agirlik = [hece(tk) for tk in toklar]
        toplam = sum(agirlik)
        ofs, bitis = baslangiclar[i], baslangiclar[i] + sureler[i]
        birikim, baslar = 0, []
        for j, ag in enumerate(agirlik):
            if j == 0:
                ham = ofs
            else:
                ham = ofs + sureler[i] * birikim / toplam
                ham = cukura_yapistir(zarf, ham)
            if baslar:
                ham = max(ham, baslar[-1] + 0.06)
            baslar.append(min(ham, bitis - 0.05))
            birikim += ag
        for j, tk in enumerate(toklar):
            s = baslar[j]
            e = baslar[j + 1] - 0.01 if j + 1 < len(baslar) else bitis
            kelimeler.append({"w": tk, "s": round(s, 2), "e": round(max(e, s + 0.08), 2)})

    os.makedirs(HEDEF_DIZIN, exist_ok=True)
    with open(f"{HEDEF_DIZIN}/kelimeler.json", "w", encoding="utf-8") as f:
        json.dump(kelimeler, f, ensure_ascii=False, indent=2)

    # --- ses zarfı (kare başına RMS, 0..1)
    kare_n = int(SR / FPS)
    deger = []
    for j in range(TOPLAM_KARE - ILK):
        parca = pcm[j * kare_n * NCH:(j + 1) * kare_n * NCH]
        deger.append(math.sqrt(sum(v * v for v in parca) / len(parca)) if parca else 0)
    maks = max(deger) or 1
    with open(f"{HEDEF_DIZIN}/genlik.json", "w") as f:
        json.dump([round(v / maks, 3) for v in deger], f)

    print(f"ses {ses_sure:.2f} sn / hedef {hedef:.2f} sn / {TOPLAM_KARE} kare")
    for i, k in enumerate(kelimeler, 1):
        print(
            "%2d %-14s %5.2f-%5.2f  f%03d"
            % (i, k["w"], k["s"], k["e"], round(k["s"] * FPS) + ILK)
        )


if __name__ == "__main__":
    main()
