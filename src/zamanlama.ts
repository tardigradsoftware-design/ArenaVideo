import kelimelerVeri from "./kelimeler.json";
import genlikVeri from "./genlik.json";
import { interpolate, spring } from "remotion";

export const FPS = 30;
export const ILK = 6; // Ses 6. karede (0.20 sn) başlar; 0. kare dolu açılır
export const TOPLAM_KARE = 756; // 25.20 sn

export interface KelimeKaydi {
  w: string;
  s: number;
  e: number;
  fs: number;
  fe: number;
}

export const KELIMELER: KelimeKaydi[] = kelimelerVeri.map((k) => ({
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

// Kilitli kelime kareleri
export const T = {
  edevlette: an("e-Devlet'te", 0), // f006
  adina: an("adına", 0), // f037
  birikmis: an("birikmiş", 0), // f047
  haberin: an("haberin", 0), // f068
  olmadigi: an("olmadığı", 0), // f089

  devletin: an("devletin", 0), // f116
  sana: an("sana", 0), // f132
  odemeyi: an("ödemeyi", 0), // f136
  bekledigi: an("beklediği", 0), // f152
  para: an("para", 0), // f168
  olabilir: an("olabilir", 0), // f175

  saglik: an("Sağlık", 0), // f203
  iadeleri: an("iadeleri", 0), // f217
  eski: an("eski", 0), // f241
  sigorta: an("sigorta", 0), // f249
  alacaklari: an("alacakları", 0), // f259
  unutulan1: an("unutulan", 0), // f295
  otomatik: an("otomatik", 0), // f314
  emeklilik: an("emeklilik", 0), // f330
  kesintileri: an("kesintileri", 0), // f341

  zamaninda: an("zamanında", 0), // f360
  cekilmezse: an("çekilmezse", 0), // f388
  zamanasimina: an("zamanaşımına", 0), // f410
  ugrayip: an("uğrayıp", 0), // f433
  devlete: an("devlete", 0), // f446
  geciyor: an("geçiyor", 0), // f459

  yorumlara: an("Yorumlara", 0), // f486
  PARA: an("PARA", 0), // f500
  yaz: an("yaz", 0), // f513

  edevletten: an("e-Devlet'ten", 0), // f530
  unutulan2: an("unutulan", 1), // f551
  paralarini: an("paralarını", 0), // f567
  saniyeler: an("saniyeler", 0), // f583
  icinde: an("içinde", 0), // f601
  sorgulama: an("sorgulama", 0), // f610
  hesabina: an("hesabına", 0), // f642
  cekme: an("çekme", 0), // f659
  rehberini: an("rehberini", 0), // f670
  hemen: an("hemen", 0), // f685
  gondereyim: an("göndereyim", 0), // f693
};

// Sahne sınır kareleri (-4 kare erken giriş, YapayTU standardı)
export const SAHNE_SINIRLARI = {
  s1: 0,
  s2: T.devletin - 4, // 112
  s3: T.saglik - 4, // 199
  s4: T.zamaninda - 3, // 357
  s5: T.yorumlara - 4, // 482
  s6: T.edevletten - 4, // 526
  bitis: TOPLAM_KARE, // 756
};

// Damga anlarında 10 karelik ekran sarsıntısı tetikleyicileri
export const SARSINTI_KARELERI = [
  T.olmadigi,
  T.para,
  T.unutulan1,
  T.zamanasimina,
  T.yaz,
  T.gondereyim,
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
