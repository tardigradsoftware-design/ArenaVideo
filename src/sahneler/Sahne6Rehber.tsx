import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { UstEtiket } from "../bilesenler/Ortak";
import { FONT_BASLIK, FONT_MONO, KART_STIL, RENK } from "../tema";
import { nabiz, SAHNE_SINIRLARI, T, yay } from "../zamanlama";

export const Sahne6Rehber: React.FC = () => {
  const localFrame = useCurrentFrame();
  const globalFrame = SAHNE_SINIRLARI.s6 + localFrame;

  // Yalnızca girişte 7 karelik içe dalış (son sahne olduğu için çıkışta kararmaz)
  const girisScale = interpolate(localFrame, [0, 7], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const girisOpacity = interpolate(localFrame, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const girisBlur = interpolate(localFrame, [0, 7], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const adim1Yay = yay(globalFrame, T.edevletten - 2, 30, 13, 195);
  const saniyeRozetYay = yay(globalFrame, T.saniyeler - 2, 30, 11, 220);
  const adim2Gorunur = globalFrame >= T.hesabina - 10;
  const adim2Yay = yay(globalFrame, T.hesabina - 10, 30, 13, 195);
  const ctaGorunur = globalFrame >= T.rehberini - 6;
  const ctaYay = yay(globalFrame, T.rehberini - 6, 30, 12, 210);
  const gonderPop = nabiz(globalFrame, T.gondereyim, 0.07);
  const okZip = Math.sin(localFrame * 0.22) * 8;

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${girisScale})`,
        opacity: girisOpacity,
        filter: girisBlur > 0.2 ? `blur(${girisBlur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket
        metin="ADIM ADIM E-DEVLET REHBERİ"
        arkaPlan={RENK.sari}
        egim={-1.5}
        top={198}
        girisKaresi={1}
      />

      {/* Adım 1: Saniyeler İçinde Sorgulama */}
      <div
        style={{
          ...KART_STIL,
          position: "absolute",
          left: 90,
          top: 298,
          width: 900,
          height: 235,
          padding: "24px 34px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          transform: `translateX(${(1 - adim1Yay) * -850}px)`,
        }}
      >
        <div
          style={{
            width: 118,
            height: 150,
            borderRadius: 22,
            border: `6px solid ${RENK.siyah}`,
            backgroundColor: RENK.acikKagit,
            display: "grid",
            placeItems: "center",
            fontSize: 56,
            flexShrink: 0,
          }}
        >
          🔍
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 32,
              letterSpacing: "-0.04em",
              color: RENK.siyah,
              marginBottom: 8,
              whiteSpace: "nowrap",
            }}
          >
            1. UNUTULAN PARAYI BUL
          </div>
          <div
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 600,
              fontSize: 24,
              color: RENK.koyuGri,
              lineHeight: 1.25,
            }}
          >
            Şahıs Ödemeleri & Takasbank BES ekranları
          </div>
        </div>

        {/* "saniyeler" kelimesinde açılan hız rozeti */}
        {globalFrame >= T.saniyeler - 2 && (
          <div
            style={{
              backgroundColor: RENK.sari,
              border: `5px solid ${RENK.siyah}`,
              borderRadius: 18,
              padding: "12px 18px",
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 25,
              color: RENK.siyah,
              transform: `scale(${saniyeRozetYay}) rotate(4deg)`,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            ⏱️ 30 SN
          </div>
        )}
      </div>

      {/* Adım 2: Hesabına Çekme */}
      {adim2Gorunur && (
        <div
          style={{
            ...KART_STIL,
            position: "absolute",
            left: 90,
            top: 560,
            width: 900,
            height: 235,
            padding: "24px 34px",
            display: "flex",
            alignItems: "center",
            gap: 24,
            backgroundColor: RENK.acikYesil,
            transform: `translateX(${(1 - adim2Yay) * 850}px)`,
          }}
        >
          <div
            style={{
              width: 118,
              height: 150,
              borderRadius: 22,
              border: `6px solid ${RENK.siyah}`,
              backgroundColor: RENK.zemin,
              display: "grid",
              placeItems: "center",
              fontSize: 56,
              flexShrink: 0,
            }}
          >
            🏦
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: FONT_BASLIK,
                fontWeight: 900,
                fontSize: 38,
                letterSpacing: "-0.04em",
                color: RENK.siyah,
                marginBottom: 8,
              }}
            >
              2. HESABINA AKTAR
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: 25,
                color: RENK.koyuGri,
              }}
            >
              TR•• IBAN tanımla ➔ Kesintisiz çek ✓
            </div>
          </div>
        </div>
      )}

      {/* Final Hero CTA Kartı — Sahnedeki TEK turuncu (#FF4D2E) blok */}
      {ctaGorunur && (
        <div
          style={{
            ...KART_STIL,
            position: "absolute",
            left: 90,
            top: 825,
            width: 900,
            height: 325,
            padding: "28px 36px",
            backgroundColor: RENK.turuncu,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            transform: `translateY(${(1 - ctaYay) * 140}px) scale(${(0.9 + 0.1 * ctaYay) * gonderPop})`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 54,
              letterSpacing: "-0.04em",
              color: "#FFFFFF",
              textAlign: "center",
              lineHeight: 1.05,
            }}
          >
            YORUMA &ldquo;PARA&rdquo; YAZ
          </div>

          <div
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 700,
              fontSize: 24,
              color: "#FFF5F2",
              textAlign: "center",
              letterSpacing: "-0.02em",
            }}
          >
            Sorgulama &amp; IBAN&rsquo;a çekme adımları anında DM&rsquo;de
          </div>

          <div
            style={{
              backgroundColor: RENK.zemin,
              color: RENK.siyah,
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 31,
              letterSpacing: "-0.03em",
              padding: "16px 32px",
              borderRadius: 20,
              border: `6px solid ${RENK.siyah}`,
              boxShadow: `8px 8px 0px ${RENK.siyah}`,
              transform: `translateY(${okZip}px)`,
            }}
          >
            📩 REHBERİ HEMEN GÖNDEREYİM!
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
