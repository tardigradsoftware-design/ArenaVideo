import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import kelimelerHam from "./aidat_kelimeler.json";
import genlikVeri from "./aidat_genlik.json";
import { Damga, NoktaliZemin, UstEtiket } from "./bilesenler/Ortak";
import { FONT_BASLIK, FONT_MONO, KART_STIL, RENK } from "./tema";
import { FPS, ILK, KelimeKaydi, nabiz, sahneGecisi, yay } from "./zamanlama";

export const AIDAT_TOPLAM_KARE = 654; // 21.80 sn

const KEL: KelimeKaydi[] = kelimelerHam.map((k) => ({
  ...k,
  fs: Math.round(k.s * FPS) + ILK,
  fe: Math.round(k.e * FPS) + ILK,
}));

const norm = (t: string) =>
  t.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9çğıöşü]/gi, "");

const anA = (kelime: string, gecis = 0): number => {
  const l = KEL.filter((k) => norm(k.w) === norm(kelime));
  if (!l[gecis]) {
    throw new Error(`Aidat kelimesi bulunamadı: ${kelime} #${gecis}`);
  }
  return l[gecis].fs;
};

const GRUP_A: number[] = [];
KEL.forEach((_, i) => {
  const onceki = KEL[i - 1];
  if (i === 0) GRUP_A.push(0);
  else if (/[.!?,;:]$/.test(onceki.w)) GRUP_A.push(i);
  else if (i >= 2 && GRUP_A[i - 1] === GRUP_A[i - 2]) GRUP_A.push(i);
  else GRUP_A.push(i - 1);
});

const TA = {
  oturdugun: anA("Oturduğun", 0), // f006
  sitede: anA("sitede", 0), // f032
  aidatlar: anA("aidatlar", 0), // f046
  kirayla: anA("kirayla", 0), // f067
  yarisir: anA("yarışır", 0), // f083
  yonetim: anA("yönetim", 0), // f123
  kafasina: anA("kafasına", 0), // f152
  belirleyemez: anA("belirleyemez", 0), // f176

  kat: anA("Kat", 0), // f214
  isletme: anA("işletme", 0), // f277
  projesine: anA("projesine", 0), // f292
  itiraz1: anA("itiraz", 0), // f309

  hem2: anA("hem", 1), // f332
  binanin: anA("binanın", 0), // f352
  demirbas: anA("demirbaş", 0), // f364
  ev: anA("ev", 0), // f400
  sahibine: anA("sahibine", 0), // f408
  yansitma: anA("yansıtma", 0), // f424
  hakkin: anA("hakkın", 0), // f439

  yorumlara: anA("Yorumlara", 0), // f475
  AIDAT: anA("AİDAT", 0), // f490
  yaz: anA("yaz", 0), // f509

  fahis: anA("fahiş", 0), // f527
  aidata: anA("aidata", 0), // f538
  itiraz2: anA("itiraz", 1), // f553
  rehberini: anA("rehberini", 0), // f570
  hemen: anA("hemen", 0), // f586
  gondereyim: anA("göndereyim", 0), // f593
};

const SINIR = {
  s1: 0,
  s2: TA.yonetim - 4, // 119
  s3: TA.kat - 4, // 210
  s4: TA.binanin - 4, // 348
  s5: TA.yorumlara - 4, // 471
  s6: TA.fahis - 4, // 523
  bitis: AIDAT_TOPLAM_KARE, // 654
};

const SARS_A = [
  TA.yarisir,
  TA.belirleyemez,
  TA.itiraz1,
  TA.hakkin,
  TA.yaz,
  TA.gondereyim,
];

const sarsintiA = (frame: number) => {
  let dx = 0;
  let dy = 0;
  for (const at of SARS_A) {
    const t = frame - at;
    if (t >= 0 && t <= 10) {
      const d = (1 - t / 10) * 14;
      dx += Math.sin(t * 2.7) * d;
      dy += Math.cos(t * 3.3) * d * 0.7;
    }
  }
  return { x: dx, y: dy };
};

const AidatAltyazi: React.FC = () => {
  const frame = useCurrentFrame();
  const aktifIndex = KEL.findIndex((k, j) => {
    const sonraki = KEL[j + 1]
      ? Math.min(KEL[j + 1].fs - 1, k.fe + 14)
      : k.fe + 18;
    return frame >= k.fs - 1 && frame < sonraki;
  });
  if (aktifIndex < 0) return null;

  const grupBasi = GRUP_A[aktifIndex];
  const grupSonu = GRUP_A.lastIndexOf(grupBasi);
  const kelimeler = KEL.slice(grupBasi, grupSonu + 1);
  const uzunluk = kelimeler.map((k) => k.w).join(" ").length;
  const fontBoyu = uzunluk > 20 ? 38 : uzunluk > 15 ? 45 : 54;

  return (
    <div
      style={{
        position: "absolute",
        top: 1252,
        left: 64,
        right: 64,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        flexWrap: "nowrap",
        zIndex: 40,
        pointerEvents: "none",
      }}
    >
      {kelimeler.map((k, idx) => {
        const gIdx = grupBasi + idx;
        const okunuyor = gIdx === aktifIndex;
        const temiz = k.w.replace(/[.,!?;:]+$/g, "").toLocaleUpperCase("tr-TR");
        const pop = okunuyor
          ? interpolate(
              Math.min(6, Math.max(0, frame - k.fs)),
              [0, 2, 6],
              [0.92, 1.07, 1.0],
            )
          : 1;
        return (
          <span
            key={`${gIdx}-${k.w}`}
            style={{
              display: "inline-block",
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: fontBoyu,
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
              padding: "10px 22px 13px",
              borderRadius: 20,
              border: `6px solid ${RENK.siyah}`,
              backgroundColor: okunuyor ? RENK.turuncu : RENK.zemin,
              color: okunuyor ? "#FFFFFF" : RENK.siyah,
              boxShadow: okunuyor
                ? `8px 8px 0px ${RENK.siyah}`
                : `6px 6px 0px ${RENK.siyah}`,
              transform: `scale(${pop})`,
            }}
          >
            {temiz}
          </span>
        );
      })}
    </div>
  );
};

const AidatRobotTu: React.FC = () => {
  const frame = useCurrentFrame();
  const sesKare = frame - ILK;
  const genlik =
    sesKare >= 0 && sesKare < genlikVeri.length ? (genlikVeri[sesKare] ?? 0) : 0;
  const salinimY = Math.sin(frame * 0.14) * 7;
  const elSolY = Math.sin(frame * 0.18 + 0.8) * 10;
  const elSagY = Math.cos(frame * 0.18 + 0.3) * 10;
  const agizYukseklik = Math.round(6 + genlik * 24);
  const agizGenislik = Math.round(28 + genlik * 14);
  const gozKirpma = frame % 95 >= 91 ? 0.15 : 1;

  return (
    <div
      style={{
        position: "absolute",
        right: 68,
        top: 1388,
        width: 190,
        height: 165,
        zIndex: 35,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 2,
          top: 76 + elSolY,
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: RENK.zemin,
          border: `5px solid ${RENK.siyah}`,
          boxShadow: `5px 5px 0px ${RENK.siyah}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 2,
          top: 72 + elSagY,
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: RENK.sari,
          border: `5px solid ${RENK.siyah}`,
          boxShadow: `5px 5px 0px ${RENK.siyah}`,
        }}
      />
      <div
        style={{
          ...KART_STIL,
          position: "absolute",
          left: 36,
          top: 22 + salinimY,
          width: 118,
          height: 104,
          borderRadius: 28,
          border: `6px solid ${RENK.siyah}`,
          boxShadow: `9px 9px 0px ${RENK.siyah}`,
          transform: `rotate(${Math.sin(frame * 0.09) * 3}deg)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -24,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: RENK.sari,
              border: `4px solid ${RENK.siyah}`,
            }}
          />
          <div style={{ width: 5, height: 8, backgroundColor: RENK.siyah }} />
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 4 }}>
          {[0, 1].map((g) => (
            <div
              key={g}
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: RENK.siyah,
                transform: `scaleY(${gozKirpma})`,
              }}
            />
          ))}
        </div>
        <div
          style={{
            marginTop: 12,
            width: agizGenislik,
            height: agizYukseklik,
            borderRadius: 12,
            backgroundColor: genlik > 0.2 ? RENK.turuncu : RENK.siyah,
            border: `3px solid ${RENK.siyah}`,
          }}
        />
      </div>
    </div>
  );
};

/* ---------------- SAHNE 1: Aidatlar Kirayla Yarışıyor ---------------- */
const AidatSahne1: React.FC = () => {
  const frame = useCurrentFrame();
  const gecis = sahneGecisi(frame, SINIR.s2 - SINIR.s1, true);

  const aidatOran = interpolate(
    frame,
    [0, TA.aidatlar, TA.yarisir + 10],
    [0.32, 0.55, 0.96],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const aidatTutar = Math.round(15500 * aidatOran);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${gecis.scale})`,
        opacity: gecis.opacity,
        filter: gecis.blur > 0.2 ? `blur(${gecis.blur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket
        metin="🏢 SİTE & APARTMAN SAKİNLERİ"
        arkaPlan={RENK.sari}
        egim={-2}
        top={200}
        girisKaresi={0}
      />

      <div
        style={{
          position: "absolute",
          top: 298,
          left: 84,
          right: 84,
          textAlign: "center",
          fontFamily: FONT_BASLIK,
          fontWeight: 900,
          fontSize: 52,
          lineHeight: 1.08,
          letterSpacing: "-0.04em",
          color: RENK.siyah,
        }}
      >
        AİDATLAR KİRAYLA
        <br />
        YARIŞIR HALE Mİ GELDİ?
      </div>

      <div
        style={{
          ...KART_STIL,
          position: "absolute",
          left: 90,
          top: 458,
          width: 900,
          height: 465,
          padding: "34px 42px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Kira Çubuğu */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 30,
              color: RENK.siyah,
              marginBottom: 12,
            }}
          >
            <span>🏠 AYLIK KİRA</span>
            <span style={{ fontFamily: FONT_MONO }}>₺16.000</span>
          </div>
          <div
            style={{
              width: "100%",
              height: 44,
              borderRadius: 18,
              border: `5px solid ${RENK.siyah}`,
              backgroundColor: RENK.acikKagit,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "96%",
                height: "100%",
                backgroundColor: RENK.siyah,
              }}
            />
          </div>
        </div>

        {/* Hızla Tırmanan Aidat Çubuğu */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 32,
              color: RENK.siyah,
              marginBottom: 12,
            }}
          >
            <span>📈 SİTE AİDATI</span>
            <span style={{ fontFamily: FONT_MONO }}>
              ₺{aidatTutar.toLocaleString("tr-TR")}
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 52,
              borderRadius: 20,
              border: `5px solid ${RENK.siyah}`,
              backgroundColor: RENK.acikKagit,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.round(aidatOran * 96)}%`,
                height: "100%",
                backgroundColor: RENK.sari,
              }}
            />
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            fontFamily: FONT_MONO,
            fontWeight: 800,
            fontSize: 26,
            color: RENK.koyuGri,
            backgroundColor: RENK.acikKagit,
            padding: "12px 20px",
            borderRadius: 16,
            border: `4px solid ${RENK.siyah}`,
          }}
        >
          NEREDEYSE 1 KİRA BEDELİ AİDAT!
        </div>
      </div>

      <Damga
        at={TA.yarisir}
        mevcutKare={frame}
        yazi="KİRAYLA YARIŞIYOR!"
        x={540}
        y={1040}
        renk={RENK.turuncu}
        boy={54}
        aci={-4}
      />
    </AbsoluteFill>
  );
};

/* ---------------- SAHNE 2: Yönetim Kafasına Göre Belirleyemez ---------------- */
const AidatSahne2: React.FC = () => {
  const localFrame = useCurrentFrame();
  const globalFrame = SINIR.s2 + localFrame;
  const gecis = sahneGecisi(localFrame, SINIR.s3 - SINIR.s2);
  const kartYay = yay(localFrame, 1, 30, 13, 195);

  const cizgi = interpolate(
    globalFrame,
    [TA.kafasina, TA.kafasina + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${gecis.scale})`,
        opacity: gecis.opacity,
        filter: gecis.blur > 0.2 ? `blur(${gecis.blur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket
        metin="⚖️ HUKUKİ SINIR NET!"
        arkaPlan={RENK.sari}
        egim={2}
        top={200}
        girisKaresi={1}
      />

      <div
        style={{
          position: "absolute",
          top: 298,
          left: 84,
          right: 84,
          textAlign: "center",
          fontFamily: FONT_BASLIK,
          fontWeight: 900,
          fontSize: 52,
          lineHeight: 1.08,
          letterSpacing: "-0.04em",
          color: RENK.siyah,
        }}
      >
        YÖNETİM KAFASINA GÖRE
        <br />
        AİDAT BELİRLEYEMEZ!
      </div>

      <div
        style={{
          ...KART_STIL,
          position: "absolute",
          left: 90,
          top: 458,
          width: 900,
          height: 465,
          padding: "36px 42px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          transform: `scale(${0.9 + 0.1 * kartYay})`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 800,
            fontSize: 27,
            backgroundColor: RENK.acikKagit,
            padding: "10px 24px",
            borderRadius: 14,
            border: `4px solid ${RENK.siyah}`,
            color: RENK.koyuGri,
          }}
        >
          TEK TARAFLI YÖNETİM DUYURUSU
        </div>

        <div style={{ position: "relative", padding: "12px 24px" }}>
          <div
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 66,
              color: cizgi > 0.5 ? RENK.gri : RENK.siyah,
              letterSpacing: "-0.04em",
              whiteSpace: "nowrap",
            }}
          >
            %150 KEYFİ ZAM
          </div>
          {cizgi > 0 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: "52%",
                width: `${Math.round(cizgi * 100)}%`,
                height: 16,
                borderRadius: 8,
                backgroundColor: RENK.siyah,
                transform: "translateY(-50%) rotate(-5deg)",
              }}
            />
          )}
        </div>

        <div
          style={{
            width: "100%",
            backgroundColor: RENK.sari,
            border: `5px solid ${RENK.siyah}`,
            borderRadius: 20,
            padding: "18px 26px",
            textAlign: "center",
            fontFamily: FONT_BASLIK,
            fontWeight: 900,
            fontSize: 28,
            color: RENK.siyah,
          }}
        >
          📋 USULÜNE UYGUN GENEL KURUL ŞART!
        </div>
      </div>

      <Damga
        at={TA.belirleyemez}
        mevcutKare={globalFrame}
        yazi="YETKİSİ YOK!"
        x={540}
        y={1040}
        renk={RENK.turuncu}
        boy={60}
        aci={4}
      />
    </AbsoluteFill>
  );
};

/* ---------------- SAHNE 3: Hak 1 — İşletme Projesine İtiraz ---------------- */
const AidatSahne3: React.FC = () => {
  const localFrame = useCurrentFrame();
  const globalFrame = SINIR.s3 + localFrame;
  const gecis = sahneGecisi(localFrame, SINIR.s4 - SINIR.s3);
  const kartYay = yay(localFrame, 1, 30, 13, 195);
  const madde1Yay = yay(globalFrame, TA.isletme - 2, 30, 13, 200);
  const madde2Yay = yay(globalFrame, TA.projesine, 30, 13, 200);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${gecis.scale})`,
        opacity: gecis.opacity,
        filter: gecis.blur > 0.2 ? `blur(${gecis.blur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket
        metin="📘 KAT MÜLKİYETİ KANUNU"
        arkaPlan={RENK.sari}
        egim={-1.5}
        top={198}
        girisKaresi={1}
      />

      <div
        style={{
          position: "absolute",
          top: 295,
          left: 84,
          right: 84,
          textAlign: "center",
          fontFamily: FONT_BASLIK,
          fontWeight: 900,
          fontSize: 50,
          lineHeight: 1.08,
          letterSpacing: "-0.04em",
          color: RENK.siyah,
        }}
      >
        1. YASAL HAKKIN:
        <br />
        İŞLETME PROJESİNE İTİRAZ
      </div>

      <div
        style={{
          ...KART_STIL,
          position: "absolute",
          left: 90,
          top: 452,
          width: 900,
          height: 470,
          padding: "34px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: `translateX(${(1 - kartYay) * -820}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 24,
              backgroundColor: RENK.siyah,
              color: "#FFFFFF",
              fontFamily: FONT_MONO,
              fontWeight: 800,
              fontSize: 44,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            01
          </div>
          <div>
            <div
              style={{
                fontFamily: FONT_BASLIK,
                fontWeight: 900,
                fontSize: 36,
                color: RENK.siyah,
                letterSpacing: "-0.03em",
              }}
            >
              İŞLETME PROJESİ DENETİMİ
            </div>
            <div
              style={{
                fontFamily: FONT_BASLIK,
                fontWeight: 600,
                fontSize: 24,
                color: RENK.koyuGri,
                marginTop: 6,
              }}
            >
              Şişirilmiş bütçe kalemlerini kabul etmek zorunda değilsin
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: RENK.acikKagit,
            border: `5px solid ${RENK.siyah}`,
            borderRadius: 20,
            padding: "18px 26px",
            fontFamily: FONT_BASLIK,
            fontWeight: 800,
            fontSize: 27,
            color: RENK.siyah,
            transform: `scale(${0.88 + 0.12 * madde1Yay})`,
          }}
        >
          ✓ Tebliğden itibaren 7 GÜN içinde yazılı itiraz
        </div>

        <div
          style={{
            backgroundColor: RENK.acikSari,
            border: `5px solid ${RENK.siyah}`,
            borderRadius: 20,
            padding: "18px 26px",
            fontFamily: FONT_BASLIK,
            fontWeight: 800,
            fontSize: 27,
            color: RENK.siyah,
            transform: `scale(${0.88 + 0.12 * madde2Yay})`,
          }}
        >
          ✓ İtiraz edilince karar Kat Malikleri Kuruluna taşınır
        </div>
      </div>

      <Damga
        at={TA.itiraz1}
        mevcutKare={globalFrame}
        yazi="İTİRAZ HAKKIN VAR!"
        x={540}
        y={1042}
        renk={RENK.turuncu}
        boy={54}
        aci={-3}
      />
    </AbsoluteFill>
  );
};

/* ---------------- SAHNE 4: Hak 2 — Demirbaş Gideri Ev Sahibine ---------------- */
const AidatSahne4: React.FC = () => {
  const localFrame = useCurrentFrame();
  const globalFrame = SINIR.s4 + localFrame;
  const gecis = sahneGecisi(localFrame, SINIR.s5 - SINIR.s4);
  const kartYay = yay(localFrame, 1, 30, 13, 195);
  const yansitYay = yay(globalFrame, TA.ev - 2, 30, 13, 200);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${gecis.scale})`,
        opacity: gecis.opacity,
        filter: gecis.blur > 0.2 ? `blur(${gecis.blur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket
        metin="🔑 KİRACILAR İÇİN ALTIN KURAL"
        arkaPlan={RENK.sari}
        egim={1.5}
        top={198}
        girisKaresi={1}
      />

      <div
        style={{
          position: "absolute",
          top: 295,
          left: 84,
          right: 84,
          textAlign: "center",
          fontFamily: FONT_BASLIK,
          fontWeight: 900,
          fontSize: 50,
          lineHeight: 1.08,
          letterSpacing: "-0.04em",
          color: RENK.siyah,
        }}
      >
        2. YASAL HAKKIN:
        <br />
        DEMİRBAŞ EV SAHİBİNE AİT!
      </div>

      <div
        style={{
          ...KART_STIL,
          position: "absolute",
          left: 90,
          top: 452,
          width: 900,
          height: 470,
          padding: "34px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: `translateX(${(1 - kartYay) * 820}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 24,
              backgroundColor: RENK.sari,
              color: RENK.siyah,
              border: `5px solid ${RENK.siyah}`,
              fontFamily: FONT_MONO,
              fontWeight: 800,
              fontSize: 44,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            02
          </div>
          <div>
            <div
              style={{
                fontFamily: FONT_BASLIK,
                fontWeight: 900,
                fontSize: 36,
                color: RENK.siyah,
                letterSpacing: "-0.03em",
              }}
            >
              BİNA DEMİRBAŞ GİDERLERİ
            </div>
            <div
              style={{
                fontFamily: FONT_BASLIK,
                fontWeight: 600,
                fontSize: 25,
                color: RENK.koyuGri,
                marginTop: 6,
              }}
            >
              Mantolama · Asansör değişimi · Çatı · Güçlendirme
            </div>
          </div>
        </div>

        {/* Yansıtma Transfer Kutusu */}
        <div
          style={{
            backgroundColor: RENK.acikYesil,
            border: `6px solid ${RENK.siyah}`,
            borderRadius: 22,
            padding: "24px 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transform: `scale(${0.9 + 0.1 * yansitYay})`,
          }}
        >
          <span
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 30,
              color: RENK.gri,
              textDecoration: "line-through",
              whiteSpace: "nowrap",
            }}
          >
            KİRACI ÖDER
          </span>
          <span
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 800,
              fontSize: 36,
              color: RENK.siyah,
            }}
          >
            ➔
          </span>
          <span
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 30,
              color: RENK.siyah,
              backgroundColor: RENK.zemin,
              padding: "12px 22px",
              borderRadius: 16,
              border: `5px solid ${RENK.siyah}`,
              whiteSpace: "nowrap",
            }}
          >
            ✓ EV SAHİBİNE YANSIT
          </span>
        </div>
      </div>

      <Damga
        at={TA.hakkin}
        mevcutKare={globalFrame}
        yazi="KİRADAN MAHSUP ET!"
        x={540}
        y={1042}
        renk={RENK.turuncu}
        boy={52}
        aci={3}
      />
    </AbsoluteFill>
  );
};

/* ---------------- SAHNE 5: Yorumlara AİDAT Yaz ---------------- */
const AidatSahne5: React.FC = () => {
  const localFrame = useCurrentFrame();
  const globalFrame = SINIR.s5 + localFrame;
  const gecis = sahneGecisi(localFrame, SINIR.s6 - SINIR.s5);
  const kartYay = yay(localFrame, 1, 30, 12, 200);

  const harfler = ["A", "İ", "D", "A", "T"];
  const say = harfler.filter(
    (_, idx) => globalFrame >= TA.AIDAT - 2 + idx * 3,
  ).length;
  const yazilan = harfler.slice(0, say).join("");

  const tikT = globalFrame - TA.yaz;
  const butonOlcek =
    tikT >= 0 && tikT <= 10
      ? interpolate(tikT, [0, 3, 10], [1, 0.84, 1.08])
      : 1;

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${gecis.scale})`,
        opacity: gecis.opacity,
        filter: gecis.blur > 0.2 ? `blur(${gecis.blur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket
        metin="ÜCRETSİZ DİLEKÇE & İTİRAZ REHBERİ"
        arkaPlan={RENK.sari}
        egim={-2}
        top={205}
        girisKaresi={1}
      />

      <div
        style={{
          position: "absolute",
          top: 308,
          left: 84,
          right: 84,
          textAlign: "center",
          fontFamily: FONT_BASLIK,
          fontWeight: 900,
          fontSize: 64,
          lineHeight: 1.05,
          letterSpacing: "-0.04em",
          color: RENK.siyah,
        }}
      >
        YORUMLARA YAZ 👇
      </div>

      <div
        style={{
          ...KART_STIL,
          position: "absolute",
          left: 90,
          top: 435,
          width: 900,
          height: 515,
          padding: "36px 42px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transform: `scale(${0.88 + 0.12 * kartYay})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: RENK.sari,
              border: `5px solid ${RENK.siyah}`,
              display: "grid",
              placeItems: "center",
              fontSize: 36,
            }}
          >
            💬
          </div>
          <div>
            <div
              style={{
                fontFamily: FONT_BASLIK,
                fontWeight: 900,
                fontSize: 32,
                color: RENK.siyah,
              }}
            >
              YENİ YORUM EKLE
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: 24,
                color: RENK.gri,
              }}
            >
              Otomatik DM rehberi aktif
            </div>
          </div>
        </div>

        <div
          style={{
            height: 185,
            borderRadius: 26,
            border: `7px solid ${RENK.siyah}`,
            backgroundColor: RENK.acikKagit,
            padding: "0 28px 0 34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 82,
              letterSpacing: "0.01em",
              color: RENK.siyah,
              whiteSpace: "nowrap",
            }}
          >
            <span>{yazilan}</span>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 82,
                marginLeft: 8,
                backgroundColor:
                  Math.floor(localFrame / 6) % 2 === 0
                    ? RENK.siyah
                    : "transparent",
              }}
            />
          </div>

          <div
            style={{
              backgroundColor: RENK.turuncu,
              color: "#FFFFFF",
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 32,
              padding: "24px 30px",
              borderRadius: 22,
              border: `6px solid ${RENK.siyah}`,
              boxShadow: `7px 7px 0px ${RENK.siyah}`,
              transform: `scale(${butonOlcek})`,
              whiteSpace: "nowrap",
            }}
          >
            GÖNDER ↑
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            fontFamily: FONT_BASLIK,
            fontWeight: 800,
            fontSize: 28,
            color: RENK.koyuGri,
          }}
        >
          Tek kelime yeterli: &ldquo;AİDAT&rdquo;
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- SAHNE 6: Fahiş Aidata İtiraz Rehberi & CTA ---------------- */
const AidatSahne6: React.FC = () => {
  const localFrame = useCurrentFrame();
  const globalFrame = SINIR.s6 + localFrame;

  const girisScale = interpolate(localFrame, [0, 7], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const girisOpacity = interpolate(localFrame, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const girisBlur = interpolate(localFrame, [0, 7], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const k1Yay = yay(globalFrame, TA.fahis - 2, 30, 13, 195);
  const k2Yay = yay(globalFrame, TA.itiraz2 - 6, 30, 13, 195);
  const ctaGorunur = globalFrame >= TA.rehberini - 8;
  const ctaYay = yay(globalFrame, TA.rehberini - 8, 30, 12, 210);
  const gonderPop = nabiz(globalFrame, TA.gondereyim, 0.07);
  const zip = Math.sin(localFrame * 0.22) * 8;

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${girisScale})`,
        opacity: girisOpacity,
        filter: girisBlur > 0.2 ? `blur(${girisBlur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket
        metin="FAHİŞ AİDATA İTİRAZ PAKETİ"
        arkaPlan={RENK.sari}
        egim={-1.5}
        top={198}
        girisKaresi={1}
      />

      {/* Paket İçeriği 1 */}
      <div
        style={{
          ...KART_STIL,
          position: "absolute",
          left: 90,
          top: 298,
          width: 900,
          height: 235,
          padding: "24px 34px",
          display: "flex",
          alignItems: "center",
          gap: 24,
          transform: `translateX(${(1 - k1Yay) * -850}px)`,
        }}
      >
        <div
          style={{
            width: 118,
            height: 150,
            borderRadius: 22,
            border: `6px solid ${RENK.siyah}`,
            backgroundColor: RENK.acikKagit,
            display: "grid",
            placeItems: "center",
            fontSize: 54,
            flexShrink: 0,
          }}
        >
          📝
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 33,
              letterSpacing: "-0.04em",
              color: RENK.siyah,
              marginBottom: 8,
              whiteSpace: "nowrap",
            }}
          >
            1. HAZIR İTİRAZ DİLEKÇESİ
          </div>
          <div
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 600,
              fontSize: 24,
              color: RENK.koyuGri,
              lineHeight: 1.25,
            }}
          >
            İşletme projesine 7 günlük resmi itiraz şablonu
          </div>
        </div>
      </div>

      {/* Paket İçeriği 2 */}
      {globalFrame >= TA.itiraz2 - 6 && (
        <div
          style={{
            ...KART_STIL,
            position: "absolute",
            left: 90,
            top: 560,
            width: 900,
            height: 235,
            padding: "24px 34px",
            display: "flex",
            alignItems: "center",
            gap: 24,
            backgroundColor: RENK.acikYesil,
            transform: `translateX(${(1 - k2Yay) * 850}px)`,
          }}
        >
          <div
            style={{
              width: 118,
              height: 150,
              borderRadius: 22,
              border: `6px solid ${RENK.siyah}`,
              backgroundColor: RENK.zemin,
              display: "grid",
              placeItems: "center",
              fontSize: 54,
              flexShrink: 0,
            }}
          >
            🏠
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: FONT_BASLIK,
                fontWeight: 900,
                fontSize: 33,
                letterSpacing: "-0.04em",
                color: RENK.siyah,
                marginBottom: 8,
                whiteSpace: "nowrap",
              }}
            >
              2. DEMİRBAŞ AYRIM TABLOSU
            </div>
            <div
              style={{
                fontFamily: FONT_MONO,
                fontWeight: 700,
                fontSize: 24,
                color: RENK.koyuGri,
              }}
            >
              Ev sahibine yansıtılacak giderler listesi ✓
            </div>
          </div>
        </div>
      )}

      {/* Hero CTA Kartı */}
      {ctaGorunur && (
        <div
          style={{
            ...KART_STIL,
            position: "absolute",
            left: 90,
            top: 825,
            width: 900,
            height: 325,
            padding: "28px 36px",
            backgroundColor: RENK.turuncu,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            transform: `translateY(${(1 - ctaYay) * 140}px) scale(${(0.9 + 0.1 * ctaYay) * gonderPop})`,
          }}
        >
          <div
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 52,
              letterSpacing: "-0.04em",
              color: "#FFFFFF",
              textAlign: "center",
              lineHeight: 1.05,
              whiteSpace: "nowrap",
            }}
          >
            YORUMA &ldquo;AİDAT&rdquo; YAZ
          </div>

          <div
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 700,
              fontSize: 24,
              color: "#FFF5F2",
              textAlign: "center",
              letterSpacing: "-0.02em",
            }}
          >
            Fahiş aidata itiraz &amp; demirbaş rehberi DM&rsquo;de
          </div>

          <div
            style={{
              backgroundColor: RENK.zemin,
              color: RENK.siyah,
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 31,
              letterSpacing: "-0.03em",
              padding: "16px 32px",
              borderRadius: 20,
              border: `6px solid ${RENK.siyah}`,
              boxShadow: `8px 8px 0px ${RENK.siyah}`,
              transform: `translateY(${zip}px)`,
              whiteSpace: "nowrap",
            }}
          >
            📩 REHBERİ HEMEN GÖNDEREYİM!
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const AidatVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const sars = sarsintiA(frame);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        fontFamily: FONT_BASLIK,
      }}
    >
      <NoktaliZemin />

      <AbsoluteFill
        style={{
          transform: `translate(${sars.x.toFixed(1)}px, ${sars.y.toFixed(1)}px)`,
        }}
      >
        <Sequence from={SINIR.s1} durationInFrames={SINIR.s2 - SINIR.s1}>
          <AidatSahne1 />
        </Sequence>
        <Sequence from={SINIR.s2} durationInFrames={SINIR.s3 - SINIR.s2}>
          <AidatSahne2 />
        </Sequence>
        <Sequence from={SINIR.s3} durationInFrames={SINIR.s4 - SINIR.s3}>
          <AidatSahne3 />
        </Sequence>
        <Sequence from={SINIR.s4} durationInFrames={SINIR.s5 - SINIR.s4}>
          <AidatSahne4 />
        </Sequence>
        <Sequence from={SINIR.s5} durationInFrames={SINIR.s6 - SINIR.s5}>
          <AidatSahne5 />
        </Sequence>
        <Sequence from={SINIR.s6} durationInFrames={SINIR.bitis - SINIR.s6}>
          <AidatSahne6 />
        </Sequence>
      </AbsoluteFill>

      <AidatAltyazi />
      <AidatRobotTu />

      <Sequence from={ILK}>
        <Audio src={staticFile("aidat_ses.mp3")} volume={1} />
      </Sequence>
      <Audio src={staticFile("aidat_sfx.wav")} volume={0.85} />
    </AbsoluteFill>
  );
};
