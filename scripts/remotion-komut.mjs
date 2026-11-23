// Remotion CLI sarmalayıcısı: render/still çağrılarına headless Chromium yolunu
// ve gerekli LD_LIBRARY_PATH'i otomatik ekler.
//
// Kullanım:
//   node scripts/remotion-komut.mjs render src/index.ts EdevletParaReel ciktilar/x.mp4
//   node scripts/remotion-komut.mjs still  src/index.ts AidatReel kare.png --frame=120
//   node scripts/remotion-komut.mjs studio src/index.ts --port=3000
import {spawnSync} from "node:child_process";
import {chromeHazirla} from "./chrome.mjs";

const argv = process.argv.slice(2);
if (argv.length === 0) {
  console.error("Kullanım: node scripts/remotion-komut.mjs <render|still|studio|bundle> [...args]");
  process.exit(1);
}

const altKomut = argv[0];
const {executablePath, env} = await chromeHazirla();

const ekArgs =
  altKomut === "render" || altKomut === "still"
    ? [`--browser-executable=${executablePath}`]
    : [];

const sonuc = spawnSync(
  "npx",
  ["remotion", ...argv, ...ekArgs],
  {stdio: "inherit", env},
);

process.exit(sonuc.status ?? 1);
