import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Damga, UstEtiket } from "../bilesenler/Ortak";
import { FONT_BASLIK, FONT_MONO, KART_STIL, RENK } from "../tema";
import { SAHNE_SINIRLARI, sahneGecisi, T, yay } from "../zamanlama";

interface KalemVerisi {
  no: string;
  ikon: string;
  baslik: string;
  altYazi: string;
  girisKaresi: number;
  rozetRenk: string;
  rozetYaziRenk: string;
  yon: number;
}

export const Sahne3Kalemler: React.FC = () => {
  const localFrame = useCurrentFrame();
  const globalFrame = SAHNE_SINIRLARI.s3 + localFrame;
  const sure = SAHNE_SINIRLARI.s4 - SAHNE_SINIRLARI.s3;
  const gecis = sahneGecisi(localFrame, sure);

  const kalemler: KalemVerisi[] = [
    {
      no: "01",
      ikon: "🏥",
      baslik: "SAĞLIK İADELERİ",
      altYazi: "SGK ilaç, muayene & yol farkı ödemeleri",
      girisKaresi: T.saglik - 2,
      rozetRenk: RENK.siyah,
      rozetYaziRenk: "#FFFFFF",
      yon: -1,
    },
    {
      no: "02",
      ikon: "🛡️",
      baslik: "ESKİ SİGORTA",
      altYazi: "Unutulan prim iadeleri & şahıs alacakları",
      girisKaresi: T.eski - 2,
      rozetRenk: RENK.sari,
      rozetYaziRenk: RENK.siyah,
      yon: 1,
    },
    {
      no: "03",
      ikon: "🏦",
      baslik: "OTOMATİK BES",
      altYazi: "Eski işyerlerinden kalan emeklilik kesintileri",
      girisKaresi: T.unutulan1 - 2,
      rozetRenk: RENK.siyah,
      rozetYaziRenk: "#FFFFFF",
      yon: -1,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${gecis.scale})`,
        opacity: gecis.opacity,
        filter: gecis.blur > 0.2 ? `blur(${gecis.blur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket
        metin="NEREDEN BİRİKİYOR? (3 KALEM)"
        arkaPlan={RENK.sari}
        egim={-1.5}
        top={198}
        girisKaresi={1}
      />

      {kalemler.map((k, idx) => {
        if (globalFrame < k.girisKaresi - 2) return null;
        const e = yay(globalFrame, k.girisKaresi - 2, 30, 13, 195);
        const kaymaX = (1 - e) * 880 * k.yon;
        const topPx = 315 + idx * 255;

        return (
          <div
            key={k.no}
            style={{
              ...KART_STIL,
              position: "absolute",
              left: 90,
              top: topPx,
              width: 900,
              height: 222,
              padding: "24px 32px",
              display: "flex",
              alignItems: "center",
              gap: 26,
              transform: `translateX(${kaymaX}px)`,
              backgroundColor: idx === 2 ? RENK.acikSari : RENK.zemin,
            }}
          >
            {/* Numara ve İkon Kutusu */}
            <div
              style={{
                width: 132,
                height: 158,
                borderRadius: 22,
                border: `6px solid ${RENK.siyah}`,
                backgroundColor: k.rozetRenk,
                color: k.rozetYaziRenk,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                gap: 4,
              }}
            >
              <span style={{ fontSize: 44, lineHeight: 1 }}>{k.ikon}</span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontWeight: 800,
                  fontSize: 32,
                }}
              >
                {k.no}
              </span>
            </div>

            {/* Başlık ve Açıklama */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: FONT_BASLIK,
                  fontWeight: 900,
                  fontSize: 43,
                  letterSpacing: "-0.04em",
                  color: RENK.siyah,
                  lineHeight: 1.08,
                  marginBottom: 10,
                }}
              >
                {k.baslik}
              </div>
              <div
                style={{
                  fontFamily: FONT_BASLIK,
                  fontWeight: 600,
                  fontSize: 25,
                  color: RENK.koyuGri,
                  lineHeight: 1.25,
                }}
              >
                {k.altYazi}
              </div>
            </div>
          </div>
        );
      })}

      {/* Sahnedeki TEK turuncu (#FF4D2E) vurgu: "unutulan" kelimesinde düşen damga */}
      <Damga
        at={T.unutulan1 + 2}
        mevcutKare={globalFrame}
        yazi="EN ÇOK UNUTULAN!"
        x={540}
        y={1135}
        renk={RENK.turuncu}
        boy={48}
        aci={-3}
      />
    </AbsoluteFill>
  );
};
