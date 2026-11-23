import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { NoktaliZemin } from "../bilesenler/Ortak";
import { AltyaziSeridi } from "../bilesenler/Altyazi";
import { RobotTuGovde } from "../bilesenler/Robot";
import { FONT_BASLIK } from "../tema";
import {
  ekranSarsintisi,
  GRUP,
  ILK,
  KELIMELER,
  SAHNE_SINIRLARI,
  sesGenligi,
  TOPLAM_KARE,
} from "./zamanlama";
import {
  Sahne1Hook,
  Sahne2Yonetim,
  Sahne3Isletme,
  Sahne4Demirbas,
  Sahne5Cta,
} from "./sahneler";

/**
 * "Fahiş aidata itiraz" reels'i (dikey 1080x1920, 20,4 sn).
 * Seslendirme public/aidat2_ses.wav, müzik yatağı public/aidat_sfx.wav.
 */
export const FahisAidatVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const sars = ekranSarsintisi(frame);

  const sahneNo =
    frame < SAHNE_SINIRLARI.s2
      ? 1
      : frame < SAHNE_SINIRLARI.s3
        ? 2
        : frame < SAHNE_SINIRLARI.s4
          ? 3
          : frame < SAHNE_SINIRLARI.s5
            ? 4
            : 5;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        fontFamily: FONT_BASLIK,
      }}
    >
      <NoktaliZemin />

      {/* Ana sahne katmanı (ekran sarsıntısı buraya uygulanır) */}
      <AbsoluteFill
        style={{
          transform: `translate(${sars.x.toFixed(1)}px, ${sars.y.toFixed(1)}px)`,
        }}
      >
        <Sequence
          name="1-Hook"
          from={SAHNE_SINIRLARI.s1}
          durationInFrames={SAHNE_SINIRLARI.s2 - SAHNE_SINIRLARI.s1}
        >
          <Sahne1Hook baslangic={SAHNE_SINIRLARI.s1} />
        </Sequence>
        <Sequence
          name="2-Yonetim"
          from={SAHNE_SINIRLARI.s2}
          durationInFrames={SAHNE_SINIRLARI.s3 - SAHNE_SINIRLARI.s2}
        >
          <Sahne2Yonetim baslangic={SAHNE_SINIRLARI.s2} />
        </Sequence>
        <Sequence
          name="3-Isletme-Projesi"
          from={SAHNE_SINIRLARI.s3}
          durationInFrames={SAHNE_SINIRLARI.s4 - SAHNE_SINIRLARI.s3}
        >
          <Sahne3Isletme baslangic={SAHNE_SINIRLARI.s3} />
        </Sequence>
        <Sequence
          name="4-Demirbas"
          from={SAHNE_SINIRLARI.s4}
          durationInFrames={SAHNE_SINIRLARI.s5 - SAHNE_SINIRLARI.s4}
        >
          <Sahne4Demirbas baslangic={SAHNE_SINIRLARI.s4} />
        </Sequence>
        <Sequence
          name="5-CTA"
          from={SAHNE_SINIRLARI.s5}
          durationInFrames={SAHNE_SINIRLARI.bitis - SAHNE_SINIRLARI.s5}
        >
          <Sahne5Cta baslangic={SAHNE_SINIRLARI.s5} />
        </Sequence>
      </AbsoluteFill>

      {/* İki kelimelik vurgulu altyazı */}
      <AltyaziSeridi kelimeler={KELIMELER} grup={GRUP} />

      {/* Sese duyarlı Robot Tu maskotu */}
      <RobotTuGovde sahneNo={sahneNo} genlik={sesGenligi(frame)} />

      {/* Seslendirme: 6. karede (0.20 sn) başlar */}
      <Sequence name="Seslendirme" from={ILK}>
        <Audio src={staticFile("aidat2_ses.wav")} volume={1} />
      </Sequence>

      {/* Müzik yatağı */}
      <Audio src={staticFile("aidat_sfx.wav")} volume={0.85} />
    </AbsoluteFill>
  );
};

export const FAHIS_TOPLAM_KARE = TOPLAM_KARE;
