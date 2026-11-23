import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT_BASLIK, KART_STIL, RENK } from "../tema";
import { GRUP, KELIMELER, SAHNE_SINIRLARI, sesGenligi, yay } from "../zamanlama";

/**
 * Beyaz kâğıt zemin + sürekli hafif kayan nokta deseni
 */
export const NoktaliZemin: React.FC = () => {
  const frame = useCurrentFrame();
  const kaymaX = (frame * 0.45) % 32;
  const kaymaY = (frame * 0.35) % 32;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: RENK.zemin,
        backgroundImage:
          "radial-gradient(#D5D8E2 2.4px, transparent 2.4px)",
        backgroundSize: "32px 32px",
        backgroundPosition: `${kaymaX}px ${kaymaY}px`,
      }}
    />
  );
};

/**
 * Üst kategori etiketi (Neo-Brutalist rozet)
 */
export const UstEtiket: React.FC<{
  metin: string;
  arkaPlan?: string;
  yaziRengi?: string;
  egim?: number;
  top?: number;
  girisKaresi?: number;
}> = ({
  metin,
  arkaPlan = RENK.sari,
  yaziRengi = RENK.siyah,
  egim = -2,
  top = 200,
  girisKaresi = 0,
}) => {
  const frame = useCurrentFrame();
  const e = girisKaresi <= 0 ? 1 : yay(frame, girisKaresi, 30, 12, 200);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          backgroundColor: arkaPlan,
          color: yaziRengi,
          fontFamily: FONT_BASLIK,
          fontWeight: 900,
          fontSize: 32,
          letterSpacing: "-0.03em",
          padding: "12px 30px 14px",
          border: `6px solid ${RENK.siyah}`,
          borderRadius: 20,
          boxShadow: `8px 8px 0px ${RENK.siyah}`,
          transform: `scale(${e}) rotate(${egim}deg)`,
        }}
      >
        {metin}
      </div>
    </div>
  );
};

/**
 * Önemli kelimede ekrana çakılan Neo-Brutalist damga
 */
export const Damga: React.FC<{
  at: number;
  mevcutKare?: number;
  yazi: string;
  x?: number;
  y: number;
  renk?: string;
  yaziRengi?: string;
  boy?: number;
  aci?: number;
}> = ({
  at,
  mevcutKare,
  yazi,
  x = 540,
  y,
  renk = RENK.turuncu,
  yaziRengi = "#FFFFFF",
  boy = 58,
  aci = -5,
}) => {
  const localFrame = useCurrentFrame();
  const frame = mevcutKare ?? localFrame;
  if (frame < at - 1) return null;

  const e = yay(frame, at - 1, 30, 11, 230);
  const olcek = interpolate(e, [0, 1], [2.4, 1]);
  const donus = interpolate(Math.min(1, e), [0, 1], [aci * 2.8, aci]);
  const opaklik = Math.min(1, e * 3.5);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${olcek}) rotate(${donus}deg)`,
        opacity: opaklik,
        backgroundColor: renk,
        color: yaziRengi,
        fontFamily: FONT_BASLIK,
        fontWeight: 900,
        fontSize: boy,
        letterSpacing: "-0.04em",
        whiteSpace: "nowrap",
        padding: `${Math.round(boy * 0.18)}px ${Math.round(boy * 0.44)}px ${Math.round(boy * 0.22)}px`,
        border: `7px solid ${RENK.siyah}`,
        borderRadius: Math.round(boy * 0.32),
        boxShadow: `12px 12px 0px ${RENK.siyah}`,
        zIndex: 30,
      }}
    >
      {yazi}
    </div>
  );
};

/**
 * Alt-ortada iki kelime iki kelime akan, okunan kelimeyi vurgulayan altyazı
 */
export const Altyazi: React.FC = () => {
  const frame = useCurrentFrame();

  const aktifIndex = KELIMELER.findIndex((k, j) => {
    const sonrakiBas = KELIMELER[j + 1]
      ? Math.min(KELIMELER[j + 1].fs - 1, k.fe + 14)
      : k.fe + 18;
    return frame >= k.fs - 1 && frame < sonrakiBas;
  });

  if (aktifIndex < 0) return null;

  const grupBasi = GRUP[aktifIndex];
  const grupSonu = GRUP.lastIndexOf(grupBasi);
  const kelimeler = KELIMELER.slice(grupBasi, grupSonu + 1);

  const toplamUzunluk = kelimeler.map((k) => k.w).join(" ").length;
  const fontBoyu = toplamUzunluk > 20 ? 38 : toplamUzunluk > 15 ? 45 : 54;

  return (
    <div
      style={{
        position: "absolute",
        top: 1252,
        left: 64,
        right: 64,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        flexWrap: "nowrap",
        zIndex: 40,
        pointerEvents: "none",
      }}
    >
      {kelimeler.map((k, idx) => {
        const globalIdx = grupBasi + idx;
        const okunuyor = globalIdx === aktifIndex;
        const temiz = k.w.replace(/[.,!?;:]+$/g, "").toLocaleUpperCase("tr-TR");
        const pop = okunuyor
          ? interpolate(
              Math.min(6, Math.max(0, frame - k.fs)),
              [0, 2, 6],
              [0.92, 1.07, 1.0],
            )
          : 1;

        return (
          <span
            key={`${globalIdx}-${k.w}`}
            style={{
              display: "inline-block",
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: fontBoyu,
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
              padding: "10px 22px 13px",
              borderRadius: 20,
              border: `6px solid ${RENK.siyah}`,
              backgroundColor: okunuyor ? RENK.turuncu : RENK.zemin,
              color: okunuyor ? "#FFFFFF" : RENK.siyah,
              boxShadow: okunuyor
                ? `8px 8px 0px ${RENK.siyah}`
                : `6px 6px 0px ${RENK.siyah}`,
              transform: `scale(${pop})`,
            }}
          >
            {temiz}
          </span>
        );
      })}
    </div>
  );
};

/**
 * Robot Tu: Sağ altta gövdesiz yüzen kafa + havada süzülen eller,
 * sese göre açılıp kapanan ağız ve sahneye göre değişen ifade.
 */
export const RobotTu: React.FC = () => {
  const frame = useCurrentFrame();
  const genlik = sesGenligi(frame);

  // Hangi sahnedeyiz? (0..5)
  const sahneNo =
    frame < SAHNE_SINIRLARI.s2
      ? 1
      : frame < SAHNE_SINIRLARI.s3
        ? 2
        : frame < SAHNE_SINIRLARI.s4
          ? 3
          : frame < SAHNE_SINIRLARI.s5
            ? 4
            : frame < SAHNE_SINIRLARI.s6
              ? 5
              : 6;

  const salinimY = Math.sin(frame * 0.14) * 7;
  const elSolY = Math.sin(frame * 0.18 + 0.8) * 10;
  const elSagY = Math.cos(frame * 0.18 + 0.3) * 10;
  const kafaEgim = Math.sin(frame * 0.09) * 3 + (sahneNo === 4 ? -4 : 0);
  const agizYukseklik = Math.round(6 + genlik * 24);
  const agizGenislik = Math.round(28 + genlik * 14);
  const gozKirpma = frame % 95 >= 91 ? 0.15 : 1;

  // Sahneye göre anten rengi
  const antenRenk =
    sahneNo === 4
      ? RENK.turuncu
      : sahneNo === 5 || sahneNo === 6
        ? RENK.sari
        : RENK.sari;

  return (
    <div
      style={{
        position: "absolute",
        right: 68,
        top: 1388,
        width: 190,
        height: 165,
        zIndex: 35,
        pointerEvents: "none",
      }}
    >
      {/* Sol süzülen el */}
      <div
        style={{
          position: "absolute",
          left: 2,
          top: 76 + elSolY + (sahneNo === 5 ? -18 : 0),
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: RENK.zemin,
          border: `5px solid ${RENK.siyah}`,
          boxShadow: `5px 5px 0px ${RENK.siyah}`,
        }}
      />

      {/* Sağ süzülen el */}
      <div
        style={{
          position: "absolute",
          right: 2,
          top: 72 + elSagY - (sahneNo === 6 ? 16 : 0),
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: sahneNo === 5 || sahneNo === 6 ? RENK.sari : RENK.zemin,
          border: `5px solid ${RENK.siyah}`,
          boxShadow: `5px 5px 0px ${RENK.siyah}`,
        }}
      />

      {/* Yüzen Kafa */}
      <div
        style={{
          ...KART_STIL,
          position: "absolute",
          left: 36,
          top: 22 + salinimY,
          width: 118,
          height: 104,
          borderRadius: 28,
          border: `6px solid ${RENK.siyah}`,
          boxShadow: `9px 9px 0px ${RENK.siyah}`,
          transform: `rotate(${kafaEgim}deg)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: RENK.zemin,
        }}
      >
        {/* Anten */}
        <div
          style={{
            position: "absolute",
            top: -24,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: antenRenk,
              border: `4px solid ${RENK.siyah}`,
            }}
          />
          <div
            style={{
              width: 5,
              height: 8,
              backgroundColor: RENK.siyah,
            }}
          />
        </div>

        {/* Göz ekranı */}
        <div
          style={{
            display: "flex",
            gap: 20,
            alignItems: "center",
            marginTop: 4,
          }}
        >
          {[0, 1].map((g) => (
            <div
              key={g}
              style={{
                width: 16,
                height: sahneNo === 4 ? 18 : 16,
                borderRadius: 8,
                backgroundColor: RENK.siyah,
                transform: `scaleY(${gozKirpma})`,
              }}
            />
          ))}
        </div>

        {/* Sese duyarlı ağız */}
        <div
          style={{
            marginTop: 12,
            width: agizGenislik,
            height: agizYukseklik,
            borderRadius: 12,
            backgroundColor: genlik > 0.2 ? RENK.turuncu : RENK.siyah,
            border: `3px solid ${RENK.siyah}`,
          }}
        />
      </div>
    </div>
  );
};
