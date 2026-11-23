import React from "react";
import { useCurrentFrame } from "remotion";
import { KART_STIL, RENK } from "../tema";

/**
 * Robot Tu: sağ altta gövdesiz yüzen kafa + havada süzülen eller.
 * Ağız açıklığı dışarıdan verilen ses zarfına (0..1), göz/anten ifadesi
 * sahne numarasına göre değişir.
 */
export const RobotTuGovde: React.FC<{
  sahneNo: number;
  genlik: number;
}> = ({ sahneNo, genlik }) => {
  const frame = useCurrentFrame();

  const salinimY = Math.sin(frame * 0.14) * 7;
  const elSolY = Math.sin(frame * 0.18 + 0.8) * 10;
  const elSagY = Math.cos(frame * 0.18 + 0.3) * 10;
  const kafaEgim = Math.sin(frame * 0.09) * 3 + (sahneNo === 4 ? -4 : 0);
  const agizYukseklik = Math.round(6 + genlik * 24);
  const agizGenislik = Math.round(28 + genlik * 14);
  const gozKirpma = frame % 95 >= 91 ? 0.15 : 1;

  const antenRenk = sahneNo === 4 ? RENK.turuncu : RENK.sari;

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
      {/* Sol süzülen el */}
      <div
        style={{
          position: "absolute",
          left: 2,
          top: 76 + elSolY + (sahneNo === 5 ? -18 : 0),
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: RENK.zemin,
          border: `5px solid ${RENK.siyah}`,
          boxShadow: `5px 5px 0px ${RENK.siyah}`,
        }}
      />

      {/* Sağ süzülen el */}
      <div
        style={{
          position: "absolute",
          right: 2,
          top: 72 + elSagY - (sahneNo === 6 ? 16 : 0),
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: sahneNo === 5 || sahneNo === 6 ? RENK.sari : RENK.zemin,
          border: `5px solid ${RENK.siyah}`,
          boxShadow: `5px 5px 0px ${RENK.siyah}`,
        }}
      />

      {/* Yüzen kafa */}
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
          transform: `rotate(${kafaEgim}deg)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: RENK.zemin,
        }}
      >
        {/* Anten */}
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
              backgroundColor: antenRenk,
              border: `4px solid ${RENK.siyah}`,
            }}
          />
          <div style={{ width: 5, height: 8, backgroundColor: RENK.siyah }} />
        </div>

        {/* Göz ekranı */}
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 4 }}>
          {[0, 1].map((g) => (
            <div
              key={g}
              style={{
                width: 16,
                height: sahneNo === 4 ? 18 : 16,
                borderRadius: 8,
                backgroundColor: RENK.siyah,
                transform: `scaleY(${gozKirpma})`,
              }}
            />
          ))}
        </div>

        {/* Sese duyarlı ağız */}
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
