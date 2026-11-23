// Renkli emoji fontunu (Noto Color Emoji, COLR/CPAL) node_modules'tan
// public/fonts altına kopyalar. Font ~25 MB olduğu için repoda tutulmaz.
import fs from "node:fs";
import path from "node:path";

const kok = process.cwd();
const kaynak = path.join(
  kok,
  "node_modules",
  "@expo-google-fonts",
  "noto-color-emoji",
  "400Regular",
  "NotoColorEmoji_400Regular.ttf",
);
const hedefDizin = path.join(kok, "public", "fonts");
const hedef = path.join(hedefDizin, "noto-color-emoji.ttf");

if (fs.existsSync(hedef)) {
  console.log("✓ Emoji fontu hazır:", hedef);
  process.exit(0);
}

if (!fs.existsSync(kaynak)) {
  console.warn(
    "! Emoji fontu bulunamadı. Önce `npm install` çalıştırın (paket: @expo-google-fonts/noto-color-emoji).",
  );
  process.exit(0);
}

fs.mkdirSync(hedefDizin, {recursive: true});
fs.copyFileSync(kaynak, hedef);
console.log("✓ Emoji fontu kopyalandı:", hedef);
