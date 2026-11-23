import React from "react";
import {
  AbsoluteFill,
  Audio,
  Composition,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Altyazi, NoktaliZemin, RobotTu } from "./bilesenler/Ortak";
import { Sahne1Hook } from "./sahneler/Sahne1Hook";
import { Sahne2Odeme } from "./sahneler/Sahne2Odeme";
import { Sahne3Kalemler } from "./sahneler/Sahne3Kalemler";
import { Sahne4Zamanasimi } from "./sahneler/Sahne4Zamanasimi";
import { Sahne5Yorum } from "./sahneler/Sahne5Yorum";
import { Sahne6Rehber } from "./sahneler/Sahne6Rehber";
import { AIDAT_TOPLAM_KARE, AidatVideo } from "./AidatVideo";
import { FONT_BASLIK } from "./tema";
import {
  ekranSarsintisi,
  FPS,
  ILK,
  SAHNE_SINIRLARI,
  TOPLAM_KARE,
} from "./zamanlama";

export const EdevletParaVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const sars = ekranSarsintisi(frame);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        fontFamily: FONT_BASLIK,
      }}
    >
      <NoktaliZemin />

      {/* Ana Sahne Katmanı (ekran sarsıntısı buraya uygulanır) */}
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
          <Sahne1Hook />
        </Sequence>

        <Sequence
          name="2-Bekleyen-Odeme"
          from={SAHNE_SINIRLARI.s2}
          durationInFrames={SAHNE_SINIRLARI.s3 - SAHNE_SINIRLARI.s2}
        >
          <Sahne2Odeme />
        </Sequence>

        <Sequence
          name="3-Uc-Kalem"
          from={SAHNE_SINIRLARI.s3}
          durationInFrames={SAHNE_SINIRLARI.s4 - SAHNE_SINIRLARI.s3}
        >
          <Sahne3Kalemler />
        </Sequence>

        <Sequence
          name="4-Zamanasimi"
          from={SAHNE_SINIRLARI.s4}
          durationInFrames={SAHNE_SINIRLARI.s5 - SAHNE_SINIRLARI.s4}
        >
          <Sahne4Zamanasimi />
        </Sequence>

        <Sequence
          name="5-Yorum-PARA"
          from={SAHNE_SINIRLARI.s5}
          durationInFrames={SAHNE_SINIRLARI.s6 - SAHNE_SINIRLARI.s5}
        >
          <Sahne5Yorum />
        </Sequence>

        <Sequence
          name="6-Rehber-CTA"
          from={SAHNE_SINIRLARI.s6}
          durationInFrames={SAHNE_SINIRLARI.bitis - SAHNE_SINIRLARI.s6}
        >
          <Sahne6Rehber />
        </Sequence>
      </AbsoluteFill>

      {/* İki kelimelik vurgulu altyazı */}
      <Altyazi />

      {/* Sağ alt sese duyarlı Robot Tu maskotu */}
      <RobotTu />

      {/* Seslendirme: kesintisiz, 6. karede (0.20 sn) başlar */}
      <Sequence name="Seslendirme" from={ILK}>
        <Audio src={staticFile("ses.mp3")} volume={1} />
      </Sequence>

      {/* Sürekli hafif müzik yatağı ve kelimeye kilitli efekt sesleri */}
      <Audio src={staticFile("sfx_bed.wav")} volume={0.85} />
    </AbsoluteFill>
  );
};

export const MyComposition: React.FC = () => {
  return (
    <>
      <Composition
        id="EdevletParaReel"
        component={EdevletParaVideo}
        durationInFrames={TOPLAM_KARE}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="AidatReel"
        component={AidatVideo}
        durationInFrames={AIDAT_TOPLAM_KARE}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
