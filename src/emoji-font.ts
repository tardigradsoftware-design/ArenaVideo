import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Noto Color Emoji (COLR/CPAL — Chromium renkli emoji desteği) public/fonts altında.
// Emoji ve simge aralıkları, Unbounded / JetBrains Mono ailelerine bağlanır;
// böylece metin içindeki emojiler de tofu kutusu yerine gerçek glifle çizilir.
export const EMOJI_ARALIK =
  "U+200D,U+20E3,U+203C,U+2049,U+2190-21FF,U+2300-23FF,U+25A0-27BF,U+2B00-2BFF,U+3030,U+303D,U+3297,U+3299,U+FE0F,U+1F000-1FAFF";

const AGIRLIKLAR = ["400", "600", "700", "800", "900"];

export const emojiFontlariniYukle = (aileler: string[]) => {
  for (const aile of aileler) {
    for (const agirlik of AGIRLIKLAR) {
      void loadFont({
        family: aile,
        url: staticFile("fonts/noto-color-emoji.ttf"),
        weight: agirlik,
        unicodeRange: EMOJI_ARALIK,
        format: "truetype",
      });
    }
  }
};
