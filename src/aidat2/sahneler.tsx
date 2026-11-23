import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT_BASLIK, FONT_MONO, KART_STIL, RENK } from "../tema";
import { Damga, UstEtiket } from "../bilesenler/Ortak";
import { nabiz, sahneGecisi, T, yay } from "./zamanlama";

const KART: React.CSSProperties = {
  ...KART_STIL,
  position: "absolute",
  left: 64,
  right: 64,
};

const Etiket: React.FC<{
  children: React.ReactNode;
  arkaPlan?: string;
  yaziRengi?: string;
  boy?: number;
  stil?: React.CSSProperties;
}> = ({ children, arkaPlan = RENK.siyah, yaziRengi = "#FFFFFF", boy = 26, stil }) => (
  <span
    style={{
      display: "inline-block",
      backgroundColor: arkaPlan,
      color: yaziRengi,
      fontFamily: FONT_MONO,
      fontWeight: 800,
      fontSize: boy,
      letterSpacing: "-0.01em",
      padding: "8px 16px 10px",
      borderRadius: 12,
      border: `5px solid ${RENK.siyah}`,
      boxShadow: `6px 6px 0px ${RENK.siyah}`,
      ...stil,
    }}
  >
    {children}
  </span>
);

/* ------------------------------------------------------------------ 1. HOOK */
export const Sahne1Hook: React.FC<{ baslangic: number }> = ({ baslangic }) => {
  const yerel = useCurrentFrame();
  const frame = yerel + baslangic;
  const g = sahneGecisi(yerel, 115, true);

  const kiraBar = yay(frame, 18, 30, 16, 120);
  const aidatBar = yay(frame, 46, 30, 15, 110);
  const asim = interpolate(frame, [T.yarisir, T.yarisir + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const kiraTutar = Math.round(interpolate(frame, [18, 40], [0, 8500], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const aidatTutar = Math.round(interpolate(frame, [46, 74], [0, 12750], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${g.scale})`,
        opacity: g.opacity,
        filter: g.blur > 0.2 ? `blur(${g.blur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket metin="SİTE • YÖNETİM" top={196} egim={-2} girisKaresi={1} />

      {/* Başlık */}
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 64,
          right: 64,
          textAlign: "center",
          fontFamily: FONT_BASLIK,
          fontWeight: 900,
          fontSize: 72,
          lineHeight: 1.04,
          letterSpacing: "-0.045em",
          color: RENK.siyah,
        }}
      >
        AİDATLAR
        <div style={{ marginTop: 16 }}>
          <span
            style={{
              display: "inline-block",
              backgroundColor: RENK.turuncu,
              color: "#FFFFFF",
              padding: "6px 22px 12px",
              border: `7px solid ${RENK.siyah}`,
              borderRadius: 22,
              boxShadow: `10px 10px 0px ${RENK.siyah}`,
              transform: `scale(${0.9 + yay(frame, 12) * 0.1})`,
            }}
          >
            KİRAYLA YARIŞIYOR
          </span>
        </div>
      </div>

      {/* Yarış kartı */}
      <div style={{ ...KART, top: 620, height: 520, padding: "34px 38px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 26,
          }}
        >
          <Etiket arkaPlan={RENK.acikKagit} yaziRengi={RENK.koyuGri} boy={24}>
            SON 12 AY
          </Etiket>
          <Etiket arkaPlan={RENK.sari} boy={24} stil={{ opacity: asim }}>
            %48 ↑
          </Etiket>
        </div>

        {/* KİRA satırı */}
        <div style={{ marginBottom: 34 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontFamily: FONT_BASLIK,
                fontWeight: 900,
                fontSize: 38,
                letterSpacing: "-0.04em",
                color: RENK.siyah,
              }}
            >
              KİRA
            </span>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontWeight: 800,
                fontSize: 40,
                color: RENK.koyuGri,
              }}
            >
              ₺{kiraTutar.toLocaleString("tr-TR")}
            </span>
          </div>
          <div
            style={{
              height: 54,
              borderRadius: 14,
              border: `6px solid ${RENK.siyah}`,
              backgroundColor: RENK.acikKagit,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${kiraBar * 54}%`,
                height: "100%",
                backgroundColor: RENK.sari,
                borderRight: `6px solid ${RENK.siyah}`,
              }}
            />
          </div>
        </div>

        {/* AİDAT satırı */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontFamily: FONT_BASLIK,
                fontWeight: 900,
                fontSize: 38,
                letterSpacing: "-0.04em",
                color: RENK.siyah,
              }}
            >
              AİDAT
            </span>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontWeight: 800,
                fontSize: 40,
                color: RENK.turuncu,
                transform: `scale(${nabiz(frame, T.yarisir, 0.12)})`,
              }}
            >
              ₺{aidatTutar.toLocaleString("tr-TR")}
            </span>
          </div>
          <div
            style={{
              height: 54,
              borderRadius: 14,
              border: `6px solid ${RENK.siyah}`,
              backgroundColor: RENK.acikTuruncu,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${aidatBar * 76}%`,
                height: "100%",
                backgroundColor: RENK.turuncu,
                borderRight: `6px solid ${RENK.siyah}`,
              }}
            />
          </div>
        </div>
      </div>

      <Damga at={T.yarisir} mevcutKare={frame} yazi="KİRAYI GEÇTİ!" y={1150} boy={52} />
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------- 2. KANUNA GÖRE */
export const Sahne2Yonetim: React.FC<{ baslangic: number }> = ({ baslangic }) => {
  const yerel = useCurrentFrame();
  const frame = yerel + baslangic;
  const g = sahneGecisi(yerel, 77);

  const kafa = yay(frame, T.kafasina - 6);
  const kanun = yay(frame, T.gore1 - 6);
  const cizgi = interpolate(frame, [T.kafasina + 6, T.kafasina + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${g.scale})`,
        opacity: g.opacity,
        filter: g.blur > 0.2 ? `blur(${g.blur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket metin="YÖNETİM" top={196} egim={2} girisKaresi={1} />

      <div style={{ ...KART, top: 500, padding: "40px 40px 44px" }}>
        <Etiket arkaPlan={RENK.acikKagit} yaziRengi={RENK.koyuGri} boy={24}>
          KARARI KİM VERİR?
        </Etiket>

        {/* İptal edilen yaklaşım */}
        <div
          style={{
            marginTop: 26,
            position: "relative",
            opacity: Math.min(1, kafa * 2),
            transform: `translateY(${(1 - kafa) * 26}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "20px 24px",
              borderRadius: 20,
              border: `6px solid ${RENK.siyah}`,
              backgroundColor: RENK.acikKagit,
            }}
          >
            <span
              style={{
                fontFamily: FONT_BASLIK,
                fontWeight: 900,
                fontSize: 44,
                color: RENK.gri,
              }}
            >
              ✕
            </span>
            <span
              style={{
                fontFamily: FONT_BASLIK,
                fontWeight: 900,
                fontSize: 44,
                letterSpacing: "-0.04em",
                color: RENK.gri,
              }}
            >
              KAFASINA GÖRE
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              left: 74,
              right: 24,
              top: "50%",
              height: 8,
              backgroundColor: RENK.siyah,
              transform: `scaleX(${cizgi})`,
              transformOrigin: "left center",
            }}
          />
        </div>

        {/* Geçerli yol */}
        <div
          style={{
            marginTop: 22,
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "20px 24px",
            borderRadius: 20,
            border: `6px solid ${RENK.siyah}`,
            backgroundColor: RENK.zemin,
            boxShadow: `8px 8px 0px ${RENK.siyah}`,
            opacity: Math.min(1, kanun * 2),
            transform: `translateY(${(1 - kanun) * 26}px) scale(${0.94 + kanun * 0.06})`,
          }}
        >
          <span
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 44,
              color: RENK.turuncu,
            }}
          >
            ✓
          </span>
          <span
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 44,
              letterSpacing: "-0.04em",
              color: RENK.siyah,
            }}
          >
            KANUNA GÖRE
          </span>
        </div>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            justifyContent: "center",
            opacity: Math.min(1, Math.max(0, (frame - (T.belirleyemez - 16)) / 6)),
            transform: `scale(${0.9 + yay(frame, T.belirleyemez - 16) * 0.1})`,
          }}
        >
          <Etiket arkaPlan={RENK.sari} yaziRengi={RENK.siyah} boy={26}>
            KARARI KAT MALİKLERİ KURULU VERİR
          </Etiket>
        </div>

        <div
          style={{
            marginTop: 22,
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 22,
            color: RENK.gri,
            textAlign: "center",
          }}
        >
          634 SAYILI KAT MÜLKİYETİ KANUNU
        </div>
      </div>

      <Damga at={T.belirleyemez} mevcutKare={frame} yazi="TEK BAŞINA OLMAZ!" y={1150} boy={50} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------ 3. HAK 1: İŞLETME PROJESİ */
export const Sahne3Isletme: React.FC<{ baslangic: number }> = ({ baslangic }) => {
  const yerel = useCurrentFrame();
  const frame = yerel + baslangic;
  const g = sahneGecisi(yerel, 116);
  const giris = yay(yerel, 6);
  const yediGun = yay(frame, T.projesine - 4, 30, 12, 210);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${g.scale})`,
        opacity: g.opacity,
        filter: g.blur > 0.2 ? `blur(${g.blur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket metin="KAT MÜLKİYETİ KANUNU" top={196} egim={-2} girisKaresi={1} />

      <div
        style={{
          ...KART,
          top: 400,
          padding: "38px 38px 40px",
          opacity: Math.min(1, giris * 2),
          transform: `translateY(${(1 - giris) * 30}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              backgroundColor: RENK.siyah,
              color: "#FFFFFF",
              fontFamily: FONT_MONO,
              fontWeight: 800,
              fontSize: 46,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              boxShadow: `7px 7px 0px ${RENK.sari}`,
            }}
          >
            1
          </div>
          <div
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 46,
              lineHeight: 1.06,
              letterSpacing: "-0.045em",
              color: RENK.siyah,
            }}
          >
            İŞLETME PROJESİNE
            <br />
            İTİRAZ HAKKI
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            padding: "20px 24px",
            borderRadius: 18,
            border: `6px solid ${RENK.siyah}`,
            backgroundColor: RENK.acikKagit,
            fontFamily: FONT_BASLIK,
            fontWeight: 600,
            fontSize: 32,
            lineHeight: 1.32,
            letterSpacing: "-0.02em",
            color: RENK.siyah,
          }}
        >
          Yönetim bütçeyi kafasına göre koyamaz; işletme projesi kanuna uygun olmak
          zorunda.
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "center",
            opacity: Math.min(1, yediGun * 1.6),
            transform: `scale(${0.9 + yediGun * 0.1})`,
          }}
        >
          <Etiket arkaPlan={RENK.sari} yaziRengi={RENK.siyah} boy={30}>
            ⏱ TEBLİĞDEN İTİBAREN 7 GÜN
          </Etiket>
        </div>
      </div>

      <Damga at={T.itiraz1} mevcutKare={frame} yazi="İTİRAZ HAKKI" y={1150} boy={54} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------- 4. HAK 2: DEMİRBAŞ → EV SAHİBİ */
const DEMIRBASLAR = ["ASANSÖR", "ÇATI", "DIŞ CEPHE"];

export const Sahne4Demirbas: React.FC<{ baslangic: number }> = ({ baslangic }) => {
  const yerel = useCurrentFrame();
  const frame = yerel + baslangic;
  const g = sahneGecisi(yerel, 132);
  const giris = yay(yerel, 4);
  const ok = yay(frame, T.ev - 8, 30, 12, 200);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${g.scale})`,
        opacity: g.opacity,
        filter: g.blur > 0.2 ? `blur(${g.blur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket metin="DEMİRBAŞ GİDERLERİ" top={196} egim={2} girisKaresi={1} />

      <div
        style={{
          ...KART,
          top: 400,
          padding: "36px 38px 38px",
          opacity: Math.min(1, giris * 2),
          transform: `translateY(${(1 - giris) * 30}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              backgroundColor: RENK.siyah,
              color: "#FFFFFF",
              fontFamily: FONT_MONO,
              fontWeight: 800,
              fontSize: 46,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              boxShadow: `7px 7px 0px ${RENK.sari}`,
            }}
          >
            2
          </div>
          <div
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 50,
              lineHeight: 1.03,
              letterSpacing: "-0.045em",
              color: RENK.siyah,
            }}
          >
            EV SAHİBİNE
            <br />
            YANSITMA HAKKI
          </div>
        </div>

        {/* Akış: kiracı -> ev sahibi */}
        <div
          style={{
            marginTop: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <Etiket arkaPlan={RENK.acikKagit} yaziRengi={RENK.siyah} boy={26}>
            KİRACI ÖDER
          </Etiket>
          <div
            style={{
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 40,
              color: RENK.siyah,
              transform: `translateX(${(1 - ok) * -12}px) scale(${0.5 + ok * 0.5})`,
              opacity: Math.min(1, ok * 2),
            }}
          >
            ➔
          </div>
          <Etiket arkaPlan={RENK.turuncu} boy={26}>
            EV SAHİBİ
          </Etiket>
        </div>

        {/* Demirbaş kalemleri */}
        <div
          style={{
            marginTop: 28,
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {DEMIRBASLAR.map((m, i) => {
            const e = yay(frame, T.demirbas - 2 + i * 5, 30, 12, 210);
            return (
              <span
                key={m}
                style={{
                  fontFamily: FONT_MONO,
                  fontWeight: 800,
                  fontSize: 26,
                  backgroundColor: RENK.zemin,
                  color: RENK.siyah,
                  padding: "10px 18px 12px",
                  borderRadius: 12,
                  border: `5px solid ${RENK.siyah}`,
                  boxShadow: `5px 5px 0px ${RENK.siyah}`,
                  opacity: Math.min(1, e * 2),
                  transform: `scale(${0.8 + e * 0.2})`,
                }}
              >
                {m}
              </span>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 28,
            padding: "18px 22px",
            borderRadius: 18,
            border: `6px solid ${RENK.siyah}`,
            backgroundColor: RENK.acikYesil,
            fontFamily: FONT_BASLIK,
            fontWeight: 600,
            fontSize: 28,
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
            color: RENK.siyah,
            textAlign: "center",
          }}
        >
          Demirbaş gideri kiracının değil, malikin yükümlülüğü.
        </div>
      </div>

      <Damga at={T.yansitma} mevcutKare={frame} yazi="EV SAHİBİNE!" y={1150} boy={54} />
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- 5. CTA */
export const Sahne5Cta: React.FC<{ baslangic: number }> = ({ baslangic }) => {
  const yerel = useCurrentFrame();
  const frame = yerel + baslangic;
  const g = sahneGecisi(yerel, 172);
  const giris = yay(yerel, 4);

  const harfler = ["A", "İ", "D", "A", "T"];
  const tik = yay(frame, T.yaz - 4, 30, 10, 230);
  const dm = yay(yerel, 8, 30, 14, 140);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${g.scale})`,
        opacity: g.opacity,
        filter: g.blur > 0.2 ? `blur(${g.blur.toFixed(1)}px)` : undefined,
      }}
    >
      <UstEtiket metin="REHBER DM'DE" top={196} egim={-2} girisKaresi={1} />

      {/* Yorum kutusu */}
      <div
        style={{
          ...KART,
          top: 380,
          padding: "34px 36px 36px",
          opacity: Math.min(1, giris * 2),
          transform: `translateY(${(1 - giris) * 28}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_BASLIK,
            fontWeight: 900,
            fontSize: 46,
            letterSpacing: "-0.045em",
            color: RENK.siyah,
            marginBottom: 22,
          }}
        >
          YORUMLARA YAZ
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 96,
              padding: "0 24px",
              borderRadius: 18,
              border: `6px solid ${RENK.siyah}`,
              backgroundColor: RENK.acikKagit,
            }}
          >
            {harfler.map((h, i) => {
              const gorunur = frame >= T.aidat + i * 3;
              return (
                <span
                  key={`${h}-${i}`}
                  style={{
                    fontFamily: FONT_BASLIK,
                    fontWeight: 900,
                    fontSize: 52,
                    letterSpacing: "-0.04em",
                    color: RENK.siyah,
                    opacity: gorunur ? 1 : 0,
                    transform: `translateY(${gorunur ? 0 : 12}px)`,
                  }}
                >
                  {h}
                </span>
              );
            })}
            <div
              style={{
                width: 5,
                height: 46,
                marginLeft: 6,
                backgroundColor: RENK.siyah,
                opacity: frame % 16 < 8 ? 1 : 0,
              }}
            />
          </div>

          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 18,
              border: `6px solid ${RENK.siyah}`,
              backgroundColor: RENK.turuncu,
              display: "grid",
              placeItems: "center",
              fontFamily: FONT_BASLIK,
              fontWeight: 900,
              fontSize: 34,
              color: "#FFFFFF",
              boxShadow: `7px 7px 0px ${RENK.siyah}`,
              transform: `scale(${0.92 + tik * 0.08})`,
            }}
          >
            ➔
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: 22,
            color: RENK.koyuGri,
          }}
        >
          TEK KELİME: AİDAT
        </div>
      </div>

      {/* DM kartı */}
      <div
        style={{
          ...KART,
          top: 760,
          padding: "32px 36px 34px",
          backgroundColor: RENK.turuncu,
          opacity: Math.min(1, dm * 2),
          transform: `translateY(${(1 - dm) * 34}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_BASLIK,
            fontWeight: 900,
            fontSize: 44,
            lineHeight: 1.04,
            letterSpacing: "-0.045em",
            color: "#FFFFFF",
          }}
        >
          FAHİŞ AİDATA İTİRAZ REHBERİ
        </div>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {[
            "1) İşletme projesine itiraz",
            "2) Demirbaş gideri paylaşımı",
            "3) Hazır dilekçe örneği",
          ].map((satir, i) => (
            <div
              key={satir}
              style={{
                fontFamily: FONT_BASLIK,
                fontWeight: 600,
                fontSize: 26,
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
                opacity: Math.min(1, Math.max(0, (yerel - 12 - i * 4) / 6)),
              }}
            >
              {satir}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 22,
            display: "inline-block",
            backgroundColor: RENK.zemin,
            color: RENK.siyah,
            fontFamily: FONT_BASLIK,
            fontWeight: 900,
            fontSize: 28,
            letterSpacing: "-0.03em",
            padding: "10px 22px 13px",
            borderRadius: 16,
            border: `6px solid ${RENK.siyah}`,
            transform: `scale(${nabiz(frame, T.rehberini, 0.06)})`,
          }}
        >
          📩 REHBERİ HEMEN GÖNDEREYİM!
        </div>
      </div>

      <Damga at={T.yaz} mevcutKare={frame} yazi={'"AİDAT" YAZ!'} y={1185} boy={50} />
    </AbsoluteFill>
  );
};
