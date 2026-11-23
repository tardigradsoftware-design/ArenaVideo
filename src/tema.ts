import React from "react";
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { emojiFontlariniYukle } from "./emoji-font";

// Fontlar public/fonts altında yerel olarak durur (Google Fonts CDN'e bağımlılık yok).
const LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT =
  "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";

const fontlariYukle = (
  family: string,
  agirliklar: string[],
  dosyaOnEki: string,
) => {
  for (const agirlik of agirliklar) {
    for (const [altKume, aralik] of [
      ["latin", LATIN],
      ["latin-ext", LATIN_EXT],
    ] as const) {
      void loadFont({
        family,
        url: staticFile(`fonts/${dosyaOnEki}-${altKume}-${agirlik}-normal.woff2`),
        weight: agirlik,
        unicodeRange: aralik,
        format: "woff2",
      });
    }
  }
};

fontlariYukle("Unbounded", ["600", "700", "900"], "unbounded");
fontlariYukle("JetBrains Mono", ["700", "800"], "jetbrains-mono");
emojiFontlariniYukle(["Unbounded", "JetBrains Mono"]);

export const FONT_BASLIK = "Unbounded";
export const FONT_MONO = "JetBrains Mono";

export const RENK = {
  zemin: "#FFFFFF",
  siyah: "#0E0E10",
  turuncu: "#FF4D2E",
  sari: "#FCC033",
  gri: "#8B8E95",
  koyuGri: "#52555E",
  acikKagit: "#F6F7FA",
  acikSari: "#FFF8E1",
  acikTuruncu: "#FFF1EE",
  acikYesil: "#EAFBF0",
} as const;

export const KART_STIL: React.CSSProperties = {
  backgroundColor: RENK.zemin,
  border: `7px solid ${RENK.siyah}`,
  borderRadius: 30,
  boxShadow: `14px 14px 0px ${RENK.siyah}`,
  boxSizing: "border-box",
};
