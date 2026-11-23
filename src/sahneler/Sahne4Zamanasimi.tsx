import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Damga, UstEtiket } from "../bilesenler/Ortak";
import { FONT_BASLIK, FONT_MONO, KART_STIL, RENK } from "../tema";
import { SAHNE_SINIRLARI, sahneGecisi, T, yay } from "../zamanlama";

export const Sahne4Zamanasimi: React.FC = () => {
  const localFrame = useCurrentFrame();
  const globalFrame = SAHNE_SINIRLARI.s4 + localFrame;
  const sure = SAHNE_SINIRLARI.s5 - SAHNE_SINIRLARI.s4;
  const gecis = sahneGecisi(localFrame, sure);

  // Süre çubuğu %100'den %0'a hızla erir
  const kalanOran = interpolate(
    globalFrame,
    [T.zamaninda, T.zamanasimina],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // "çekilmezse" kelimesinde bakiyenin üstü kalın çizgiyle çizilir
  const cizgiIlerleme = interpolate(
    globalFrame,
    [T.cekilmezse, T.cekilmezse + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const iptalOldu = cizgiIlerleme > 0.5;

  // "devlete geçiyor" kutusu yaylanarak gelir
  const devirGorunur = globalFrame >= T.ugrayip;
  const devirYay = yay(globalFrame, T.ugrayip, 30, 13, 195);

  const kartGiris = yay(localFrame, 1, 30, 13, 195);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${gecis.scale})`,
        opacity: gecis.opacity,
        filter: gecis.blur > 0.2 ? `blur(${gecis.blur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket
        metin="🚨 KRİTİK SÜRE UYARISI"
        arkaPlan={RENK.sari}
        egim={2}
        top={198}
        girisKaresi={1}
      />

      <div
        style={{
          position: "absolute",
          top: 292,
          left: 84,
          right: 84,
          textAlign: "center",
          fontFamily: FONT_BASLIK,
          fontWeight: 900,
          fontSize: 52,
          lineHeight: 1.08,
          letterSpacing: "-0.04em",
          color: RENK.siyah,
        }}
      >
        ZAMANINDA ÇEKİLMEZSE
        <br />
        NE OLUYOR?
      </div>

      {/* Süre & İptal Kartı */}
      <div
        style={{
          ...KART_STIL,
          position: "absolute",
          left: 90,
          top: 440,
          width: 900,
          height: 360,
          padding: "30px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: `scale(${0.9 + 0.1 * kartGiris})`,
        }}
      >
        {/* Eriyen süre çubuğu */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
              fontFamily: FONT_MONO,
              fontWeight: 800,
              fontSize: 28,
              color: RENK.siyah,
            }}
          >
            <span>⏱️ YASAL TALEP SÜRESİ</span>
            <span>%{Math.round(kalanOran * 100)}</span>
          </div>
          <div
            style={{
              width: "100%",
              height: 34,
              borderRadius: 17,
              border: `5px solid ${RENK.siyah}`,
              backgroundColor: RENK.acikKagit,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.max(4, Math.round(kalanOran * 100))}%`,
                height: "100%",
                backgroundColor: RENK.sari,
              }}
            />
          </div>
        </div>

        {/* Üstü Çizilen Bakiye */}
        <div
          style={{
            position: "relative",
            alignSelf: "center",
            padding: "8px 24px",
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 800,
              fontSize: 92,
              letterSpacing: "-0.04em",
              color: iptalOldu ? RENK.gri : RENK.siyah,
              lineHeight: 1,
            }}
          >
            ₺4.850,00
          </div>

          {/* Kalın üstünü çizme şeridi */}
          {cizgiIlerleme > 0 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "52%",
                width: `${Math.round(cizgiIlerleme * 100)}%`,
                height: 16,
                borderRadius: 8,
                backgroundColor: RENK.siyah,
                transform: "translateY(-50%) rotate(-4deg)",
              }}
            />
          )}
        </div>

        <div
          style={{
            textAlign: "center",
            fontFamily: FONT_BASLIK,
            fontWeight: 700,
            fontSize: 26,
            color: RENK.gri,
          }}
        >
          {iptalOldu ? "HAK DÜŞÜMÜ — HESAPTAN SİLİNDİ" : "ALACAK BEKLEMEDE"}
        </div>
      </div>

      {/* Devlete Geçiyor Kartı */}
      {devirGorunur && (
        <div
          style={{
            ...KART_STIL,
            position: "absolute",
            left: 90,
            top: 830,
            width: 900,
            height: 176,
            padding: "20px 32px",
            backgroundColor: RENK.acikSari,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            transform: `translateY(${(1 - devirYay) * 110}px) scale(${0.92 + 0.08 * devirYay})`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 30,
              color: RENK.gri,
              textDecoration: "line-through",
              whiteSpace: "nowrap",
            }}
          >
            SENİN CEBİN
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 800,
              fontSize: 38,
              color: RENK.siyah,
            }}
          >
            ➔
          </div>
          <div
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 31,
              color: RENK.siyah,
              backgroundColor: RENK.zemin,
              padding: "14px 22px",
              borderRadius: 18,
              border: `5px solid ${RENK.siyah}`,
              whiteSpace: "nowrap",
            }}
          >
            🔒 DEVLETE GEÇİYOR
          </div>
        </div>
      )}

      {/* Sahnedeki TEK turuncu (#FF4D2E) vurgu: "zamanaşımına" damgası */}
      <Damga
        at={T.zamanasimina}
        mevcutKare={globalFrame}
        yazi="ZAMANAŞIMI!"
        x={540}
        y={1122}
        renk={RENK.turuncu}
        boy={56}
        aci={-4}
      />
    </AbsoluteFill>
  );
};
