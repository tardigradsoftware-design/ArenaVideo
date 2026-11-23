import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Damga, UstEtiket } from "../bilesenler/Ortak";
import { FONT_BASLIK, FONT_MONO, KART_STIL, RENK } from "../tema";
import { nabiz, SAHNE_SINIRLARI, sahneGecisi, T, yay } from "../zamanlama";

export const Sahne1Hook: React.FC = () => {
  const frame = useCurrentFrame(); // 0 .. 112
  const sure = SAHNE_SINIRLARI.s2 - SAHNE_SINIRLARI.s1;
  const gecis = sahneGecisi(frame, sure, true);

  // Tutar sayacı: 0. karede bile ₺1.250 görünür, "birikmiş" kelimesinde ₺4.850,00'e fırlar
  const sayacIlerleme = interpolate(
    frame,
    [0, T.adina, T.birikmis + 14],
    [0.26, 0.48, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const tutar = Math.round(4850 * sayacIlerleme);
  const tutarMetni = `₺${tutar.toLocaleString("tr-TR")},00`;

  // "haberin" kelimesinde bildirim zili sallanır
  const zilT = frame - T.haberin;
  const zilAci =
    zilT >= 0 && zilT <= 18
      ? Math.sin(zilT * 1.4) * (1 - zilT / 18) * 22
      : 0;

  const kartOlcek =
    frame === 0 ? 1 : 0.96 + 0.04 * Math.min(1, yay(frame, 0, 30, 14, 220));
  const birikmisPop = nabiz(frame, T.birikmis, 0.09);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${gecis.scale})`,
        opacity: gecis.opacity,
        filter: gecis.blur > 0.2 ? `blur(${gecis.blur.toFixed(1)}px)` : undefined,
      }}
    >
      {/* Üst Rozet — 0. karede tam görünür */}
      <UstEtiket
        metin="E-DEVLET KAPI · T.C. 11•••••••84"
        arkaPlan={RENK.sari}
        egim={-2}
        top={200}
        girisKaresi={0}
      />

      {/* Ana Kanca Başlığı */}
      <div
        style={{
          position: "absolute",
          top: 298,
          left: 84,
          right: 84,
          textAlign: "center",
          fontFamily: FONT_BASLIK,
          fontWeight: 900,
          fontSize: 54,
          lineHeight: 1.08,
          letterSpacing: "-0.04em",
          color: RENK.siyah,
        }}
      >
        ADINA BİRİKMİŞ
        <br />
        GİZLİ PARA OLABİLİR!
      </div>

      {/* Merkez Alacak Kasası Kartı */}
      <div
        style={{
          ...KART_STIL,
          position: "absolute",
          left: 90,
          top: 458,
          width: 900,
          height: 465,
          padding: "34px 42px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: `scale(${kartOlcek})`,
        }}
      >
        {/* Kart üst satır */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 800,
              fontSize: 28,
              color: RENK.koyuGri,
              backgroundColor: RENK.acikKagit,
              padding: "10px 20px",
              borderRadius: 14,
              border: `4px solid ${RENK.siyah}`,
            }}
          >
            ŞAHIS ALACAK KAYDI
          </div>

          {/* Bildirim zili rozeti */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: frame >= T.haberin ? RENK.sari : RENK.acikKagit,
              padding: "10px 20px",
              borderRadius: 16,
              border: `4px solid ${RENK.siyah}`,
              transform: `rotate(${zilAci}deg)`,
              fontFamily: FONT_BASLIK,
              fontWeight: 800,
              fontSize: 24,
              color: RENK.siyah,
            }}
          >
            <span>🔔</span>
            <span>0 BİLDİRİM</span>
          </div>
        </div>

        {/* Büyük dönen TL Bakiyesi */}
        <div
          style={{
            textAlign: "center",
            transform: `scale(${birikmisPop})`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 700,
              fontSize: 26,
              color: RENK.gri,
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            BEKLEYEN ÖRNEK TUTAR
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 800,
              fontSize: 102,
              letterSpacing: "-0.04em",
              color: RENK.siyah,
              lineHeight: 1,
            }}
          >
            {tutarMetni}
          </div>
        </div>

        {/* Alt 3 kategori ön-etiketi */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {["SGK İADE", "SİGORTA", "OTOMATİK BES"].map((etiket, i) => {
            const p = Math.min(1, yay(frame, 10 + i * 8, 30, 14, 190));
            return (
              <div
                key={etiket}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontFamily: FONT_BASLIK,
                  fontWeight: 800,
                  fontSize: 24,
                  padding: "12px 10px",
                  borderRadius: 16,
                  border: `4px solid ${RENK.siyah}`,
                  backgroundColor: i === 1 ? RENK.acikSari : RENK.acikKagit,
                  color: RENK.siyah,
                  transform: `scale(${0.85 + 0.15 * p})`,
                }}
              >
                {etiket}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sahnedeki TEK turuncu (#FF4D2E) vurgu: "olmadığı" kelimesinde çakılan damga */}
      <Damga
        at={T.olmadigi}
        yazi="HABERİN BİLE YOK!"
        x={540}
        y={1035}
        renk={RENK.turuncu}
        boy={56}
        aci={-4}
      />
    </AbsoluteFill>
  );
};
