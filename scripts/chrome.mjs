// Headless Chromium hazırlığı.
// Sandbox'ta remotion.media kapalı olduğu için tarayıcı @sparticuz/chromium
// paketinden çıkarılır; gereken paylaşılan kütüphaneler (libnss3 vb.) de aynı
// paketin içindeki al2023.tar.br dosyasından .chrome/lib altına açılır.
import {spawnSync} from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import chromium from "@sparticuz/chromium";

const kok = process.cwd();
const kutu = path.join(kok, ".chrome");
const libDizini = path.join(kutu, "lib");
const isaret = path.join(kutu, ".hazir");

const kutuphaneleriAc = () => {
  if (fs.existsSync(isaret) && fs.existsSync(libDizini)) {
    return libDizini;
  }

  fs.mkdirSync(kutu, {recursive: true});
  const paket = path.join(
    kok,
    "node_modules",
    "@sparticuz",
    "chromium",
    "bin",
    "al2023.tar.br",
  );
  const tarYolu = path.join(kutu, "al2023.tar");
  fs.writeFileSync(tarYolu, zlib.brotliDecompressSync(fs.readFileSync(paket)));

  const tar = spawnSync("tar", ["-xf", tarYolu, "-C", kutu], {stdio: "inherit"});
  if (tar.status !== 0) {
    throw new Error("al2023.tar açılamadı (tar bulunamadı mı?)");
  }

  fs.rmSync(tarYolu, {force: true});
  fs.writeFileSync(isaret, new Date().toISOString());
  return libDizini;
};

export const chromeHazirla = async () => {
  const executablePath = await chromium.executablePath();
  const ldLibraryPath = kutuphaneleriAc();
  const mevcut = process.env.LD_LIBRARY_PATH;
  return {
    executablePath,
    env: {
      ...process.env,
      LD_LIBRARY_PATH: mevcut ? `${ldLibraryPath}:${mevcut}` : ldLibraryPath,
    },
  };
};
