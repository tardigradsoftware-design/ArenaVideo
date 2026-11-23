import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT_BASLIK, RENK } from "../tema";

export interface AltyaziKelime {
  w: string;
  fs: number;
  fe: number;
}

/**
 * Alt-ortada iki kelime iki kelime akan, o an okunan kelimeyi turuncu kutuda
 * vurgulayan altyazı şeridi. Kelime listesi ve gruplama dışarıdan verilir;
 * böylece her kompozisyon kendi zamanlamasını kullanabilir.
 */
export const AltyaziSeridi: React.FC<{
  kelimeler: AltyaziKelime[];
  grup: number[];
  top?: number;
}> = ({ kelimeler, grup, top = 1252 }) => {
  const frame = useCurrentFrame();

  const aktifIndex = kelimeler.findIndex((k, j) => {
    const sonrakiBas = kelimeler[j + 1]
      ? Math.min(kelimeler[j + 1].fs - 1, k.fe + 14)
      : k.fe + 18;
    return frame >= k.fs - 1 && frame < sonrakiBas;
  });

  if (aktifIndex < 0) return null;

  const grupBasi = grup[aktifIndex];
  const grupSonu = grup.lastIndexOf(grupBasi);
  const gosterilecek = kelimeler.slice(grupBasi, grupSonu + 1);

  const toplamUzunluk = gosterilecek.map((k) => k.w).join(" ").length;
  const fontBoyu = toplamUzunluk > 20 ? 38 : toplamUzunluk > 15 ? 45 : 54;

  return (
    <div
      style={{
        position: "absolute",
        top,
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
      {gosterilecek.map((k, idx) => {
        const globalIdx = grupBasi + idx;
        const okunuyor = globalIdx === aktifIndex;
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
            key={`${globalIdx}-${k.w}`}
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
