// Vector 2D floor plans for VNSGN16 Sofic (floors 15/16/17).
// Geometry traced by hand from the floor images in VNSGN16_Layout.html (2000x1125 space):
// schematic, not to scale. Room/printer positions match the HTML source markers.
import React from "react";
import { Easing } from "remotion";

export const VB = { w: 2000, h: 1125 };
const ease = Easing.bezier(0.45, 0, 0.2, 1);
const appear = (frame: number, start: number | null, dur = 12) =>
  start === null ? 0 : ease(Math.max(0, Math.min(1, (frame - start) / dur)));

export type Kind = "room" | "big" | "hall" | "printer";
export type Pt = { id: string; x: number; y: number; kind: Kind; label?: string; up?: boolean; rh?: number };
type Room = { id: string; x: number; y: number; w: number; h: number; kind: "room" | "big" | "hall"; label?: string };
type Zone = { x: number; y: number; w: number; h: number; t: keyof typeof Z };
type Txt = { t: string; x: number; y: number };
type Floor = { zones: Zone[]; rooms: Room[]; texts: Txt[] };

const Z = {
  desk: "url(#desk)",
  green: "#E4EDD8",
  reception: "#D7EEF6",
  storage: "#E6EBEE",
  pantry: "#F6EDD6",
  tower: "#E9E1EE",
  rec: "#F1E3DB",
  teal: "#D9ECE8",
  counter: "#D3E2EC",
};

const SHELL = "470,155 1530,155 1975,560 1975,830 1590,1085 410,1085 25,830 25,560";
const CORE: { x: number; w: number; t: string }[] = [
  { x: 410, w: 115, t: "" }, { x: 555, w: 165, t: "WC" }, { x: 720, w: 165, t: "LIFTS" },
  { x: 975, w: 165, t: "LIFTS" }, { x: 1205, w: 110, t: "LIFTS" }, { x: 1315, w: 125, t: "WC" }, { x: 1475, w: 115, t: "" },
];

const r = (id: string, x: number, y: number, w: number, h: number, kind: Room["kind"] = "room", label?: string): Room => ({ id, x, y, w, h, kind, label });

export const FLOORS: Record<"15" | "16" | "17", Floor> = {
  "15": {
    zones: [
      { x: 240, y: 185, w: 335, h: 215, t: "green" }, { x: 800, y: 270, w: 200, h: 135, t: "green" }, { x: 1190, y: 445, w: 140, h: 175, t: "green" },
      { x: 1265, y: 190, w: 125, h: 150, t: "teal" },
      { x: 580, y: 185, w: 220, h: 220, t: "desk" }, { x: 1000, y: 185, w: 265, h: 220, t: "desk" }, { x: 1390, y: 185, w: 170, h: 155, t: "desk" },
      { x: 60, y: 410, w: 315, h: 215, t: "desk" }, { x: 420, y: 430, w: 375, h: 190, t: "desk" }, { x: 1335, y: 445, w: 290, h: 175, t: "desk" },
      { x: 1640, y: 385, w: 175, h: 330, t: "desk" }, { x: 40, y: 715, w: 340, h: 105, t: "desk" },
      { x: 800, y: 445, w: 335, h: 290, t: "reception" },
      { x: 1300, y: 650, w: 215, h: 85, t: "storage" }, { x: 420, y: 655, w: 85, h: 80, t: "storage" },
      { x: 0, y: 825, w: 425, h: 300, t: "pantry" }, { x: 1565, y: 825, w: 435, h: 300, t: "pantry" },
    ],
    rooms: [
      r("r1", 562, 655, 83, 80), r("r2", 118, 630, 82, 75), r("r3", 202, 630, 85, 75), r("r4", 497, 285, 80, 100),
      r("r5", 918, 465, 102, 82), r("r6", 1815, 505, 105, 95), r("r7", 1712, 755, 110, 70), r("r8", 1640, 755, 70, 70),
      r("r9", 1228, 655, 67, 80), r("r10", 1135, 655, 93, 80), r("r11", 1822, 610, 138, 205, "big"),
    ],
    texts: [
      { t: "RECEPTION", x: 968, y: 640 }, { t: "SOLAR PANTRY", x: 250, y: 870 }, { t: "LUNAR PANTRY", x: 1750, y: 870 },
      { t: "COLLABORATION", x: 900, y: 345 }, { t: "STORAGE", x: 1407, y: 700 },
    ],
  },
  "16": {
    zones: [
      { x: 470, y: 185, w: 415, h: 215, t: "desk" }, { x: 1035, y: 185, w: 540, h: 215, t: "desk" }, { x: 885, y: 185, w: 150, h: 215, t: "green" },
      { x: 1575, y: 175, w: 200, h: 225, t: "green" },
      { x: 470, y: 440, w: 225, h: 175, t: "desk" }, { x: 1050, y: 440, w: 570, h: 175, t: "desk" }, { x: 1640, y: 400, w: 330, h: 330, t: "desk" },
      { x: 700, y: 445, w: 310, h: 175, t: "tower" },
      { x: 240, y: 290, w: 130, h: 105, t: "storage" }, { x: 565, y: 655, w: 95, h: 80, t: "storage" }, { x: 1495, y: 655, w: 60, h: 80, t: "storage" },
      { x: 1635, y: 765, w: 170, h: 95, t: "tower" }, { x: 1805, y: 765, w: 165, h: 95, t: "pantry" },
      { x: 1580, y: 870, w: 405, h: 215, t: "rec" },
    ],
    rooms: [
      r("m7", 15, 395, 410, 690, "hall"),
      r("m1", 662, 655, 120, 80), r("m2", 376, 305, 92, 95), r("m3", 952, 245, 83, 110), r("m4", 1383, 650, 110, 85),
      r("m5", 1165, 650, 95, 85), r("m6", 1033, 650, 125, 85),
    ],
    texts: [
      { t: "CONTROL TOWER", x: 855, y: 540 }, { t: "RECREATION ROOM", x: 1700, y: 925 }, { t: "MEDICAL", x: 1720, y: 820 },
      { t: "NURSING", x: 1887, y: 820 }, { t: "M-GARDEN · PANTRY", x: 250, y: 760 },
    ],
  },
  "17": {
    zones: [
      { x: 575, y: 170, w: 895, h: 225, t: "desk" }, { x: 225, y: 395, w: 145, h: 425, t: "desk" }, { x: 35, y: 545, w: 175, h: 270, t: "desk" },
      { x: 425, y: 430, w: 350, h: 180, t: "desk" }, { x: 1365, y: 430, w: 215, h: 180, t: "desk" },
      { x: 1630, y: 395, w: 145, h: 330, t: "desk" }, { x: 1775, y: 550, w: 200, h: 170, t: "desk" },
      { x: 330, y: 160, w: 245, h: 235, t: "green" }, { x: 1470, y: 160, w: 300, h: 235, t: "green" },
      { x: 775, y: 610, w: 250, h: 110, t: "green" }, { x: 15, y: 815, w: 395, h: 270, t: "green" },
      { x: 1065, y: 545, w: 180, h: 175, t: "counter" }, { x: 1255, y: 645, w: 130, h: 75, t: "storage" }, { x: 470, y: 648, w: 75, h: 72, t: "storage" },
      { x: 1585, y: 820, w: 400, h: 265, t: "pantry" },
    ],
    rooms: [
      r("s1", 680, 648, 90, 72), r("s2", 490, 240, 85, 110), r("s3", 780, 445, 200, 160, "big"), r("s4", 1065, 445, 135, 95),
      r("s5", 1203, 445, 82, 95), r("s6", 1772, 745, 100, 75), r("s7", 1672, 745, 98, 75), r("s8", 1385, 648, 85, 72),
    ],
    texts: [
      { t: "COUNTER", x: 1155, y: 640 }, { t: "PANTRY", x: 1760, y: 880 }, { t: "COLLABORATION", x: 900, y: 672 },
    ],
  },
};

// labels shown in chips (names only; no room codes in the video)
const NAMES: Record<string, string> = {
  r1: "Vung Tau", r5: "Sai Gon", r7: "Hue", r10: "Ha Noi", r11: "Lotus",
  m1: "Europe", m2: "Africa", m4: "America", m6: "Asia", m7: "M-Garden",
  s3: "The Voyage",
};

const PRINTERS: Record<"15" | "16" | "17", Pt[]> = {
  "15": [
    { id: "p1", x: 66.2, y: 20, kind: "printer", label: "MD" },
    { id: "p2", x: 20.4, y: 63.2, kind: "printer", label: "FIN" },
    { id: "p3", x: 77, y: 58.3, kind: "printer", label: "ADM" },
  ],
  "16": [
    { id: "q1", x: 22.7, y: 62.9, kind: "printer", label: "M Garden" },
    { id: "q2", x: 79.6, y: 63.2, kind: "printer", label: "4PL" },
  ],
  "17": [
    { id: "t1", x: 79, y: 60.5, kind: "printer", label: "LK 16 PAX" },
    { id: "t2", x: 21, y: 60.5, kind: "printer", label: "LK 16 PAX" },
    { id: "t3", x: 57.7, y: 51.6, kind: "printer" },
    { id: "t4", x: 54.5, y: 52.1, kind: "printer", label: "Customer counter", up: true },
    { id: "t5", x: 60.1, y: 52.1, kind: "printer" },
  ],
};

export const pointsFor = (f: "15" | "16" | "17"): Pt[] => [
  ...FLOORS[f].rooms.map((m) => ({
    id: m.id, kind: m.kind as Kind, label: NAMES[m.id],
    // hall: anchor the chip in the upper part of the wing, not its centre
    x: ((m.x + m.w / 2) / VB.w) * 100, y: ((m.kind === "hall" ? m.y + 160 : m.y + m.h / 2) / VB.h) * 100, rh: m.kind === "hall" ? 0 : m.h / 2,
  })),
  ...PRINTERS[f],
];

export const roomIds = (f: "15" | "16" | "17") => FLOORS[f].rooms.map((m) => m.id);

export const FloorSvg: React.FC<{
  floor: "15" | "16" | "17";
  frame: number;
  showAt: (id: string) => number | null;
  heroId?: string;
  uid: string;
  z?: number; // camera zoom: labels are counter-scaled to keep a constant on-screen size
  labels?: boolean;
}> = ({ floor, frame, showAt, heroId, uid, z = 1, labels = true }) => {
  const fs = 26 / z;
  const f = FLOORS[floor];
  const pulse = 0.5 + 0.5 * Math.sin((frame / 30) * Math.PI * 2 * 0.8);
  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <clipPath id={`shell-${uid}`}><polygon points={SHELL} /></clipPath>
        <pattern id="desk" width="34" height="30" patternUnits="userSpaceOnUse">
          <rect width="34" height="30" fill="#EEF3F6" />
          <rect x="6" y="7" width="22" height="13" rx="2" fill="none" stroke="#D3DEE5" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width={VB.w} height={VB.h} fill="#F4F8FA" />
      <polygon points={SHELL} fill="#FFFFFF" />
      <g clipPath={`url(#shell-${uid})`}>
        {f.zones.map((z, k) => <rect key={k} x={z.x} y={z.y} width={z.w} height={z.h} fill={Z[z.t]} />)}
        {/* building core */}
        {CORE.map((c, k) => (
          <g key={k}>
            <rect x={c.x} y={785} width={c.w} height={245} fill="#E9EEF1" stroke="#C9D5DC" strokeWidth={3} />
            {labels && c.t && <text x={c.x + c.w / 2} y={915} textAnchor="middle" fontSize={fs * 0.85} fontWeight={600} letterSpacing={3 / z} fill="#9AABB3">{c.t}</text>}
          </g>
        ))}
        {/* rooms */}
        {f.rooms.map((m) => {
          const a = appear(frame, showAt(m.id));
          const hero = heroId === m.id;
          if (m.kind === "hall") {
            return (
              <g key={m.id}>
                <rect x={m.x} y={m.y} width={m.w} height={m.h} fill={Z.pantry} />
                <rect x={m.x} y={m.y} width={m.w} height={m.h} fill="#003E5E" opacity={a * 0.07} />
                <rect x={m.x + 6} y={m.y + 6} width={m.w - 12} height={m.h - 12} fill="none" stroke="#003E5E" strokeWidth={8} opacity={a * (hero ? 0.55 + 0.45 * pulse : 1)} />
              </g>
            );
          }
          const solid = m.kind === "big" ? "#003E5E" : "#42B0D5";
          return (
            <g key={m.id}>
              <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={6} fill="#D6ECF5" stroke="#B4D9E8" strokeWidth={3} />
              <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={6} fill={solid} opacity={a} />
              {hero && <rect x={m.x - 10} y={m.y - 10} width={m.w + 20} height={m.h + 20} rx={12} fill="none" stroke={solid} strokeWidth={6} opacity={a * (0.35 + 0.65 * pulse)} />}
            </g>
          );
        })}
        {labels && f.texts.map((t, k) => (
          <text key={k} x={t.x} y={t.y} textAnchor="middle" fontSize={fs * 0.8} fontWeight={600} letterSpacing={4 / z} fill="#8FA2AB">{t.t}</text>
        ))}
      </g>
      <polygon points={SHELL} fill="none" stroke="#003E5E" strokeWidth={7} strokeLinejoin="round" />
      {/* entrance */}
      <g transform={`translate(925 742) scale(${1 / z})`}>
        <polygon points="0,-24 20,4 7,4 7,26 -7,26 -7,4 -20,4" fill="#42B0D5" />
        {labels && <text x={30} y={10} fontSize={22} fontWeight={600} letterSpacing={3} fill="#5B6B73">ENTRANCE</text>}
      </g>
    </svg>
  );
};
