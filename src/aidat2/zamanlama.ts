import kelimelerVeri from "./kelimeler.json";
import genlikVeri from "./genlik.json";
import { interpolate, spring } from "remotion";

export const FPS = 30;
export const ILK = 6; // Ses 6. karede (0.20 sn) başlar
export const TOPLAM_KARE = 612; // 20.40 sn

export interface KelimeKaydi {
  w: string;
  s: number;
  e: number;
  fs: number;
  fe: number;
}

export const KELIMELER: KelimeKaydi[] = (
  kelimelerVeri as { w: string; s: number; e: number }[]
).map((k) => ({
  ...k,
  fs: Math.round(k.s * FPS) + ILK,
  fe: Math.round(k.e * FPS) + ILK,
}));

const norm = (t: string) =>
  t
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9çğıöşü]/gi, "");

/**
 * Kelimenin söylendiği başlangıç karesini döndürür.
 * gecis: aynı kelimenin metindeki kaçıncı geçişi (0 tabanlı).
 */
export const an = (kelime: string, gecis = 0): number => {
  const eslesen = KELIMELER.filter((k) => norm(k.w) === norm(kelime));
  if (!eslesen[gecis]) {
    throw new Error(`Kelime bulunamadı: "${kelime}" (#${gecis})`);
  }
  return eslesen[gecis].fs;
};

// İkişer kelimelik altyazı grupları (noktalama sonunda yeni grup başlatır)
export const GRUP: number[] = [];
KELIMELER.forEach((_, i) => {
  const onceki = KELIMELER[i - 1];
  if (i === 0) {
    GRUP.push(0);
  } else if (/[.!?,;:]$/.test(onceki.w)) {
    GRUP.push(i);
  } else if (i >= 2 && GRUP[i - 1] === GRUP[i - 2]) {
    GRUP.push(i);
  } else {
    GRUP.push(i - 1);
  }
});

export const sesGenligi = (frame: number): number => {
  const sesKaresi = frame - ILK;
  if (sesKaresi < 0 || sesKaresi >= genlikVeri.length) return 0;
  return genlikVeri[sesKaresi] ?? 0;
};

// Kelime kareleri
export const T = {
  oturdugun: an("Oturduğun"), // f006
  sitede: an("sitede"), // f026
  aidatlar: an("aidatlar"), // f042
  kirayla: an("kirayla"), // f060
  yarisir: an("yarışır"), // f075
  hale: an("hale"), // f091
  geldiyse: an("geldiyse"), // f102

  yonetim: an("yönetim"), // f119
  bunu: an("bunu"), // f133
  kafasina: an("kafasına"), // f138
  gore1: an("göre", 0), // f154
  belirleyemez: an("belirleyemez"), // f161

  kat: an("Kat"), // f196
  mulkiyeti: an("Mülkiyeti"), // f202
  kanununa: an("Kanunu'na"), // f217
  gore2: an("göre", 1), // f240
  hem1: an("hem", 0), // f244
  isletme: an("işletme"), // f253
  projesine: an("projesine"), // f268
  itiraz1: an("itiraz", 0), // f288
  etme: an("etme"), // f302

  hem2: an("hem", 1), // f312
  de: an("de"), // f320
  binanin: an("binanın"), // f322
  demirbas: an("demirbaş"), // f335
  giderlerini: an("giderlerini"), // f354
  ev: an("ev"), // f377
  sahibine: an("sahibine"), // f379
  yansitma: an("yansıtma"), // f397
  hakkin: an("hakkın"), // f418
  var: an("var"), // f421

  yorumlara: an("Yorumlara"), // f444
  aidat: an("AİDAT"), // f462
  yaz: an("yaz"), // f476
  fahis: an("fahiş"), // f478
  aidata: an("aidata"), // f490
  itiraz2: an("itiraz", 1), // f504
  rehberini: an("rehberini"), // f521
  hemen: an("hemen"), // f537
  gondereyim: an("göndereyim"), // f543
};

// Sahne sınır kareleri (-4 kare erken giriş, YapayTU standardı)
export const SAHNE_SINIRLARI = {
  s1: 0,
  s2: T.yonetim - 4, // 115
  s3: T.kat - 4, // 192
  s4: T.hem2 - 4, // 308
  s5: T.yorumlara - 4, // 440
  bitis: TOPLAM_KARE, // 612
};

// Damga anlarında 10 karelik ekran sarsıntısı tetikleyicileri
export const SARSINTI_KARELERI = [
  T.yarisir,
  T.belirleyemez,
  T.itiraz1,
  T.yansitma,
  T.yaz,
];

export const ekranSarsintisi = (frame: number): { x: number; y: number } => {
  let dx = 0;
  let dy = 0;
  for (const at of SARSINTI_KARELERI) {
    const t = frame - at;
    if (t >= 0 && t <= 10) {
      const sonum = (1 - t / 10) * 14;
      dx += Math.sin(t * 2.7) * sonum;
      dy += Math.cos(t * 3.3) * sonum * 0.7;
    }
  }
  return { x: dx, y: dy };
};

export const yay = (
  frame: number,
  baslangic: number,
  fps = FPS,
  damping = 13,
  stiffness = 185,
): number => {
  if (frame < baslangic) return 0;
  return spring({
    frame: frame - baslangic,
    fps,
    config: { damping, stiffness, mass: 0.78 },
  });
};

export const nabiz = (frame: number, at: number, guc = 0.1): number => {
  const t = frame - at;
  if (t < 0 || t > 12) return 1;
  return 1 + guc * (t < 3 ? t / 3 : 1 - (t - 3) / 9);
};

/**
 * 7 karelik içe dalış (zoom + hafif bulanıklık) sahne geçiş hesaplayıcısı
 */
export const sahneGecisi = (
  localFrame: number,
  durationInFrames: number,
  ilkSahneMi = false,
): { scale: number; opacity: number; blur: number } => {
  const girisScale = ilkSahneMi
    ? 1
    : interpolate(localFrame, [0, 7], [0.88, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const girisOpacity = ilkSahneMi
    ? 1
    : interpolate(localFrame, [0, 4], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const girisBlur = ilkSahneMi
    ? 0
    : interpolate(localFrame, [0, 7], [10, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  const kalan = durationInFrames - localFrame;
  const cikisScale = interpolate(kalan, [0, 7], [1.12, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cikisOpacity = interpolate(kalan, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cikisBlur = interpolate(kalan, [0, 7], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return {
    scale: girisScale * cikisScale,
    opacity: Math.min(girisOpacity, cikisOpacity),
    blur: Math.max(girisBlur, cikisBlur),
  };
};
