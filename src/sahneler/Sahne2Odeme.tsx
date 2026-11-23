import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Damga, UstEtiket } from "../bilesenler/Ortak";
import { FONT_BASLIK, FONT_MONO, KART_STIL, RENK } from "../tema";
import { SAHNE_SINIRLARI, sahneGecisi, T, yay } from "../zamanlama";

export const Sahne2Odeme: React.FC = () => {
  const localFrame = useCurrentFrame();
  const globalFrame = SAHNE_SINIRLARI.s2 + localFrame;
  const sure = SAHNE_SINIRLARI.s3 - SAHNE_SINIRLARI.s2;
  const gecis = sahneGecisi(localFrame, sure);

  const kartYay = yay(localFrame, 1, 30, 13, 190);
  const okIlerleme = interpolate(
    globalFrame,
    [T.sana, T.bekledigi + 6],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const bekliyorYay = yay(globalFrame, T.bekledigi - 2, 30, 12, 200);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${gecis.scale})`,
        opacity: gecis.opacity,
        filter: gecis.blur > 0.2 ? `blur(${gecis.blur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket
        metin="T.C. RESMİ ÖDEME HAVUZU"
        arkaPlan={RENK.sari}
        egim={2}
        top={200}
        girisKaresi={1}
      />

      <div
        style={{
          position: "absolute",
          top: 298,
          left: 84,
          right: 84,
          textAlign: "center",
          fontFamily: FONT_BASLIK,
          fontWeight: 900,
          fontSize: 52,
          lineHeight: 1.1,
          letterSpacing: "-0.04em",
          color: RENK.siyah,
        }}
      >
        DEVLET SANA ÖDEMEYİ
        <br />
        BEKLİYOR OLABİLİR
      </div>

      {/* Resmi Ödeme Akış Kartı */}
      <div
        style={{
          ...KART_STIL,
          position: "absolute",
          left: 90,
          top: 455,
          width: 900,
          height: 490,
          padding: "36px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: `translateY(${(1 - kartYay) * 140}px) scale(${0.9 + 0.1 * kartYay})`,
        }}
      >
        {/* İki kutulu transfer şeması */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
          }}
        >
          {/* Kurum Kutusu */}
          <div
            style={{
              width: 330,
              padding: "24px 20px",
              borderRadius: 24,
              border: `6px solid ${RENK.siyah}`,
              backgroundColor: RENK.acikKagit,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 54, marginBottom: 8 }}>🏛️</div>
            <div
              style={{
                fontFamily: FONT_BASLIK,
                fontWeight: 900,
                fontSize: 28,
                color: RENK.siyah,
                lineHeight: 1.15,
              }}
            >
              KURUM
              <br />
              EMANETİ
            </div>
          </div>

          {/* Hareketli Transfer Oku */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: "100%",
                height: 22,
                borderRadius: 11,
                border: `4px solid ${RENK.siyah}`,
                backgroundColor: RENK.acikKagit,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.round(okIlerleme * 100)}%`,
                  height: "100%",
                  backgroundColor: RENK.sari,
                }}
              />
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontWeight: 800,
                fontSize: 24,
                color: RENK.siyah,
                whiteSpace: "nowrap",
              }}
            >
              ➔ ₺₺₺ ➔
            </div>
          </div>

          {/* Vatandaş Kutusu */}
          <div
            style={{
              width: 330,
              padding: "24px 20px",
              borderRadius: 24,
              border: `6px solid ${RENK.siyah}`,
              backgroundColor: RENK.acikYesil,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 54, marginBottom: 8 }}>👤</div>
            <div
              style={{
                fontFamily: FONT_BASLIK,
                fontWeight: 900,
                fontSize: 28,
                color: RENK.siyah,
                lineHeight: 1.15,
              }}
            >
              SENİN T.C.
              <br />
              HESABIN
            </div>
          </div>
        </div>

        {/* Durum Satırı: "beklediği" kelimesinde yaylanarak açılır */}
        <div
          style={{
            backgroundColor: RENK.sari,
            border: `6px solid ${RENK.siyah}`,
            borderRadius: 22,
            padding: "20px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: `8px 8px 0px ${RENK.siyah}`,
            transform: `scale(${0.85 + 0.15 * Math.min(1, bekliyorYay)})`,
            opacity: globalFrame >= T.odemeyi - 2 ? 1 : 0.45,
          }}
        >
          <span
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 30,
              color: RENK.siyah,
            }}
          >
            ⏳ DURUM: TALEP BEKLİYOR
          </span>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 800,
              fontSize: 28,
              backgroundColor: RENK.zemin,
              padding: "6px 16px",
              borderRadius: 12,
              border: `4px solid ${RENK.siyah}`,
              color: RENK.siyah,
            }}
          >
            AKTİF
          </span>
        </div>
      </div>

      {/* Sahnedeki TEK turuncu (#FF4D2E) vurgu: "para" kelimesinde çakılan damga */}
      <Damga
        at={T.para}
        mevcutKare={globalFrame}
        yazi="₺ NAKİT ALACAK!"
        x={540}
        y={1048}
        renk={RENK.turuncu}
        boy={60}
        aci={4}
      />
    </AbsoluteFill>
  );
};
