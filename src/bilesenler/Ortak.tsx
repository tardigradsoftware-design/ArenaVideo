import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT_BASLIK, RENK } from "../tema";
import { GRUP, KELIMELER, SAHNE_SINIRLARI, sesGenligi, yay } from "../zamanlama";
import { AltyaziSeridi } from "./Altyazi";
import { RobotTuGovde } from "./Robot";

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
 * E-devlet ("PARA") reelsinin altyazı şeridi — zamanlaması kendi verisinden.
 */
export const Altyazi: React.FC = () => (
  <AltyaziSeridi kelimeler={KELIMELER} grup={GRUP} />
);

/**
 * E-devlet reelsinin Robot Tu maskotu — ses zarfı ve sahne numarası
 * bu kompozisyonun zamanlama dosyasından beslenir.
 */
export const RobotTu: React.FC = () => {
  const frame = useCurrentFrame();
  const genlik = sesGenligi(frame);

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

  return <RobotTuGovde sahneNo={sahneNo} genlik={genlik} />;
};
