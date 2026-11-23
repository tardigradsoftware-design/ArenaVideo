import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { UstEtiket } from "../bilesenler/Ortak";
import { FONT_BASLIK, FONT_MONO, KART_STIL, RENK } from "../tema";
import { SAHNE_SINIRLARI, sahneGecisi, T, yay } from "../zamanlama";

export const Sahne5Yorum: React.FC = () => {
  const localFrame = useCurrentFrame();
  const globalFrame = SAHNE_SINIRLARI.s5 + localFrame;
  const sure = SAHNE_SINIRLARI.s6 - SAHNE_SINIRLARI.s5;
  const gecis = sahneGecisi(localFrame, sure);

  const kartYay = yay(localFrame, 1, 30, 12, 200);

  // "PARA" harf harf yazılır (f497, f500, f503, f506)
  const harfler = ["P", "A", "R", "A"];
  const gorunenHarfSayisi = harfler.filter(
    (_, idx) => globalFrame >= T.PARA - 3 + idx * 3,
  ).length;
  const yazilanKelime = harfler.slice(0, gorunenHarfSayisi).join("");

  // "yaz" kelimesinde Gönder butonuna basılma efekti
  const tikT = globalFrame - T.yaz;
  const butonOlcek =
    tikT >= 0 && tikT <= 10
      ? interpolate(tikT, [0, 3, 10], [1, 0.84, 1.08])
      : 1;

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${gecis.scale})`,
        opacity: gecis.opacity,
        filter: gecis.blur > 0.2 ? `blur(${gecis.blur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket
        metin="ÜCRETSİZ SORGULAMA REHBERİ"
        arkaPlan={RENK.sari}
        egim={-2}
        top={205}
        girisKaresi={1}
      />

      <div
        style={{
          position: "absolute",
          top: 308,
          left: 84,
          right: 84,
          textAlign: "center",
          fontFamily: FONT_BASLIK,
          fontWeight: 900,
          fontSize: 64,
          lineHeight: 1.05,
          letterSpacing: "-0.04em",
          color: RENK.siyah,
        }}
      >
        YORUMLARA YAZ 👇
      </div>

      {/* Dev Yorum Kutusu Kartı */}
      <div
        style={{
          ...KART_STIL,
          position: "absolute",
          left: 90,
          top: 435,
          width: 900,
          height: 515,
          padding: "36px 42px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: `scale(${0.88 + 0.12 * kartYay})`,
        }}
      >
        {/* Üst kullanıcı satırı */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: RENK.sari,
              border: `5px solid ${RENK.siyah}`,
              display: "grid",
              placeItems: "center",
              fontSize: 36,
            }}
          >
            💬
          </div>
          <div>
            <div
              style={{
                fontFamily: FONT_BASLIK,
                fontWeight: 900,
                fontSize: 32,
                color: RENK.siyah,
              }}
            >
              YENİ YORUM EKLE
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: 24,
                color: RENK.gri,
              }}
            >
              Otomatik DM tetikleyicisi aktif
            </div>
          </div>
        </div>

        {/* Yazım kutusu + TEK turuncu (#FF4D2E) Gönder butonu */}
        <div
          style={{
            height: 185,
            borderRadius: 26,
            border: `7px solid ${RENK.siyah}`,
            backgroundColor: RENK.acikKagit,
            padding: "0 28px 0 38px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 96,
              letterSpacing: "0.02em",
              color: RENK.siyah,
            }}
          >
            <span>{yazilanKelime}</span>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 88,
                marginLeft: 8,
                backgroundColor:
                  Math.floor(localFrame / 6) % 2 === 0
                    ? RENK.siyah
                    : "transparent",
              }}
            />
          </div>

          {/* Gönder Butonu (Sahnedeki TEK #FF4D2E öğe) */}
          <div
            style={{
              backgroundColor: RENK.turuncu,
              color: "#FFFFFF",
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 34,
              padding: "26px 34px",
              borderRadius: 22,
              border: `6px solid ${RENK.siyah}`,
              boxShadow: `7px 7px 0px ${RENK.siyah}`,
              transform: `scale(${butonOlcek})`,
            }}
          >
            GÖNDER ↑
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            fontFamily: FONT_BASLIK,
            fontWeight: 800,
            fontSize: 28,
            color: RENK.koyuGri,
          }}
        >
          Büyük ya da küçük harf fark etmez: &ldquo;PARA&rdquo;
        </div>
      </div>
    </AbsoluteFill>
  );
};
