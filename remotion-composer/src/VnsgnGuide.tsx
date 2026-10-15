import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { FloorSvg, Pt, pointsFor, roomIds } from "./VnsgnFloors";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "800"], subsets: ["latin"] });

const FPS = 30;
const C = {
  accent: "#42B0D5",
  navy: "#003E5E",
  ink: "#111418",
  muted: "#5B6B73",
  line: "#E1E9ED",
  bg: "#FFFFFF",
  soft: "#F4F8FA",
  facility: "#8AA0A9",
};
const M = 96; // page margin
const PLAN = { x: 480, y: 150, w: 1344, h: 756 };

// ---------------------------------------------------------------- data (vector plans + source points)
const F15 = pointsFor("15");
const F16 = pointsFor("16");
const F17 = pointsFor("17");

// ---------------------------------------------------------------- beat model
type Cam = { x: number; y: number; z: number };
type Beat = {
  text: string; // subtitle (English, = voice)
  cam?: Cam; // plan scenes
  show?: string[]; // marker ids revealed from this beat on
  label?: string[]; // marker ids whose labels reveal from this beat on
  hero?: string; // marker id highlighted (card) during this beat
};
type SceneDef = { key: string; dur: number; beats: Beat[] };

const WHOLE: Cam = { x: 50, y: 50, z: 1 };
const ROOMS15 = roomIds("15");
const ROOMS16 = roomIds("16");
const ROOMS17 = roomIds("17");

const SCENES: SceneDef[] = [
  { key: "S1", dur: 8.08, beats: [
    { text: "Need a meeting room right now?", cam: WHOLE, show: ["r11"], hero: "r11" },
    { text: "Need to print, but don't know where the printer is?", cam: WHOLE, show: ["p3"], hero: "p3" },
    { text: "Give me one minute, and you'll know everything.", cam: WHOLE },
  ] },
  { key: "S2", dur: 8.92, beats: [
    { text: "Our Sofic Tower office spans three floors:" },
    { text: "fifteen, sixteen and seventeen." },
    { text: "In total, there are twenty-seven meeting rooms and ten printers." },
  ] },
  { key: "S3", dur: 12.92, beats: [
    { text: "Floor fifteen: Maersk in Vietnam.", cam: WHOLE },
    { text: "Eleven meeting rooms, named after Vietnamese cities, like Vung Tau, Sai Gon, Ha Noi and Hue.", cam: WHOLE, show: ROOMS15, label: ["r1", "r5", "r10", "r7"] },
    { text: "The biggest is Lotus, a board room for sixteen people.", cam: { x: 86, y: 62, z: 2.3 }, hero: "r11", label: ["r11"] },
    { text: "Three printers sit in the FIN, ADM and MD areas.", cam: WHOLE, show: ["p1", "p2", "p3"], label: ["p2", "p3", "p1"] },
  ] },
  { key: "S4", dur: 15.84, beats: [
    { text: "Floor sixteen: Integrating the world.", cam: WHOLE },
    { text: "Meeting rooms are named after continents: Europe, Africa, America, Asia, Oceania and more.", cam: WHOLE, show: ROOMS16.filter((id) => id !== "m7"), label: ["m1", "m2", "m4", "m6"] },
    { text: "The highlight is M-Garden, an event hall for two hundred people.", cam: { x: 22, y: 60, z: 1.6 }, show: ["m7"], hero: "m7", label: ["m7"] },
    { text: "Two printers serve the M Garden and 4PL areas.", cam: WHOLE, show: ["q1", "q2"], label: ["q1", "q2"] },
  ] },
  { key: "S5", dur: 12.8, beats: [
    { text: "Floor seventeen: Triple-E class vessel.", cam: WHOLE },
    { text: "Eight meeting rooms, and the biggest is The Voyage, with ten seats.", cam: { x: 46, y: 46, z: 1.7 }, show: ROOMS17, hero: "s3", label: ["s3"] },
    { text: "Five printers: two at the corners of the LK 16 PAX area,", cam: WHOLE, show: ["t1", "t2"], label: ["t1", "t2"] },
    { text: "and three at the customer counter.", cam: { x: 58, y: 52, z: 2.6 }, show: ["t3", "t4", "t5"], label: ["t4"] },
  ] },
  { key: "S6", dur: 10.56, beats: [
    { text: "Booking is simple." },
    { text: "In Outlook, create a meeting, then paste the room name into the Location field." },
    { text: "Or check the iPad panel at the door." },
    { text: "Every room comes with Teams VC." },
  ] },
  { key: "S7", dur: 10.2, beats: [
    { text: "Want the details?" },
    { text: "Open the interactive map and search by room name or printer code." },
    { text: "Need help? Contact VNADM@maersk.com." },
    { text: "Happy meetings, and fast printing!" },
  ] },
];

const LEAD = 6; // frames of silence before voice
const TAIL = 14; // frames after voice
const sceneFrames = (s: SceneDef) => LEAD + Math.ceil(s.dur * FPS) + TAIL;
export const VNSGN_TOTAL = SCENES.reduce((a, s) => a + sceneFrames(s), 0);

// beat start times (frames, local to scene) proportional to characters
const beatStarts = (s: SceneDef): number[] => {
  const total = s.beats.reduce((a, b) => a + b.text.length, 0);
  const span = s.dur * FPS - 10;
  let acc = 0;
  return s.beats.map((b) => {
    const st = LEAD + 4 + (acc / total) * span;
    acc += b.text.length;
    return Math.round(st);
  });
};

const ease = Easing.bezier(0.45, 0, 0.2, 1);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const appear = (frame: number, start: number, dur = 10) => ease(clamp01((frame - start) / dur));

// ---------------------------------------------------------------- small pieces
const PrinterIcon: React.FC<{ s?: number; c?: string }> = ({ s = 14, c = C.navy }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={c} strokeWidth="1.6" strokeLinejoin="round">
    <path d="M4 6V2h8v4M4 12H2V6h12v6h-2M4 9h8v5H4z" />
  </svg>
);

const Marker: React.FC<{ p: Pt; frame: number; z: number; showAt: number; labelAt: number | null; hero: boolean; ps: number }> = ({
  p, frame, z, showAt, labelAt, hero, ps,
}) => {
  const a = appear(frame, showAt, 12);
  if (a <= 0) return null;
  if (p.kind !== "printer") {
    // room shape is in the SVG; here only the name chip, centred above the room
    const la = labelAt === null ? 0 : appear(frame, labelAt, 10);
    if (!p.label || la <= 0) return null;
    return (
      <div style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: 0, height: 0, transform: `scale(${1 / z})`, transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", left: 0, top: -((p.rh ?? 0) * ps * z) - 10, transform: `translate(-50%, -100%) translateY(${(1 - la) * 8}px)`,
          opacity: la, whiteSpace: "nowrap", background: p.kind === "room" ? "#fff" : C.navy, color: p.kind === "room" ? C.navy : "#fff",
          fontWeight: 600, fontSize: 20, padding: "6px 12px", borderRadius: 6, border: `1px solid ${p.kind === "room" ? C.line : C.navy}`,
          boxShadow: "0 2px 8px rgba(0,62,94,.14)" }}>{p.label}</div>
      </div>
    );
  }
  const size = 24;
  const la = labelAt === null ? 0 : appear(frame, labelAt, 10);
  const pulse = hero ? ((frame % 60) / 60) : 0;
  return (
    <div style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: 0, height: 0, transform: `scale(${1 / z})`, transformOrigin: "0 0" }}>
      {hero && (
        <div style={{ position: "absolute", left: -size, top: -size, width: size * 2, height: size * 2, borderRadius: "50%",
          border: `3px solid ${C.accent}`, opacity: 1 - pulse, transform: `scale(${0.6 + pulse * 0.9})` }} />
      )}
      <div style={{
        position: "absolute", left: -size / 2, top: -size / 2, width: size, height: size, boxSizing: "border-box",
        borderRadius: p.kind === "printer" ? 7 : "50%",
        background: p.kind === "printer" ? "#fff" : p.kind === "big" ? C.navy : C.accent,
        border: p.kind === "printer" ? `3px solid ${C.navy}` : "3px solid #fff",
        boxShadow: "0 1px 4px rgba(0,62,94,.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${a})`,
      }}>
        {p.kind === "printer" && <PrinterIcon s={size - 10} />}
      </div>
      {p.label && la > 0 && (
        <div style={{
          position: "absolute", left: p.up ? -90 : size / 2 + 8, top: p.up ? -(size / 2 + 56) : -17, whiteSpace: "nowrap", opacity: la,
          transform: `translateX(${(1 - la) * -8}px)`, background: "#fff", color: C.navy, fontWeight: 600, fontSize: 20,
          padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.line}`, boxShadow: "0 2px 8px rgba(0,62,94,.14)",
        }}>{p.label}</div>
      )}
    </div>
  );
};

const Subtitle: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: M, bottom: 46, maxWidth: 1500, fontSize: 30, fontWeight: 400, color: C.ink,
    lineHeight: 1.3, letterSpacing: "-0.005em" }}>
    <span style={{ background: "rgba(255,255,255,0.94)", padding: "4px 0", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{text}</span>
  </div>
);

const TopBar: React.FC<{ right: string }> = ({ right }) => (
  <div style={{ position: "absolute", left: M, right: M, top: 52, display: "flex", justifyContent: "space-between", alignItems: "center",
    fontSize: 15, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted }}>
    <span><span style={{ display: "inline-block", width: 10, height: 10, background: C.accent, marginRight: 12 }} />VNSGN16 Sofic</span>
    <span>{right}</span>
  </div>
);

const Legend: React.FC<{ rooms: number; printers: number; frame: number; at: number }> = ({ rooms, printers, frame, at }) => {
  const a = appear(frame, at, 14);
  return (
    <div style={{ opacity: a, transform: `translateY(${(1 - a) * 10}px)`, display: "flex", flexDirection: "column", gap: 14, marginTop: 36 }}>
      <div style={{ height: 2, width: 56, background: C.navy }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, color: C.ink }}>
        <span style={{ width: 16, height: 16, borderRadius: "50%", background: C.accent, flex: "0 0 auto" }} />
        <b style={{ fontWeight: 800 }}>{rooms}</b> meeting rooms
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, color: C.ink }}>
        <span style={{ width: 16, height: 16, borderRadius: 4, border: `3px solid ${C.navy}`, boxSizing: "border-box", flex: "0 0 auto" }} />
        <b style={{ fontWeight: 800 }}>{printers}</b> printers
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- scenes
const useBeat = (s: SceneDef, frame: number) => {
  const starts = beatStarts(s);
  let i = 0;
  for (let k = 0; k < starts.length; k++) if (frame >= starts[k]) i = k;
  return { starts, i };
};

const PlanScene: React.FC<{ s: SceneDef; floor: "15" | "16" | "17"; pts: Pt[]; num: string; title: string; rooms: number; printers: number; intro?: boolean }>
= ({ s, floor, pts, num, title, rooms, printers, intro }) => {
  const frame = useCurrentFrame();
  const { starts, i } = useBeat(s, frame);
  // camera
  const camAt = (k: number) => s.beats[Math.max(0, k)].cam ?? WHOLE;
  const prev = camAt(i - 1);
  const cur = camAt(i);
  const t = ease(clamp01((frame - starts[i]) / 24));
  const cam = i === 0 ? cur : { x: prev.x + (cur.x - prev.x) * t, y: prev.y + (cur.y - prev.y) * t, z: prev.z + (cur.z - prev.z) * t };
  const z = cam.z;
  const tx = Math.min(0, Math.max(PLAN.w * (1 - z), PLAN.w / 2 - (cam.x / 100) * PLAN.w * z));
  const ty = Math.min(0, Math.max(PLAN.h * (1 - z), PLAN.h / 2 - (cam.y / 100) * PLAN.h * z));
  // reveal bookkeeping
  const showAt = (id: string): number | null => {
    for (let k = 0; k < s.beats.length; k++) if (s.beats[k].show?.includes(id)) return starts[k];
    return null;
  };
  const labelAt = (id: string): number | null => {
    for (let k = 0; k < s.beats.length; k++) {
      const idx = s.beats[k].label?.indexOf(id) ?? -1;
      if (idx >= 0) return starts[k] + idx * 9 + 4;
    }
    return null;
  };
  const heroId = s.beats[i].hero;
  const planIn = appear(frame, 0, 14);
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily }}>
      <TopBar right="Meeting rooms & printers" />
      {/* left column */}
      <div style={{ position: "absolute", left: M, top: PLAN.y - 6, width: PLAN.x - M - 40 }}>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, opacity: appear(frame, 4) }}>Floor</div>
        <div style={{ fontSize: 210, fontWeight: 800, color: C.navy, lineHeight: 0.9, letterSpacing: "-0.05em", opacity: appear(frame, 4, 14), transform: `translateY(${(1 - appear(frame, 4, 14)) * 18}px)` }}>{num}</div>
        <div style={{ fontSize: 26, fontWeight: 600, color: C.ink, marginTop: 14, lineHeight: 1.25, opacity: appear(frame, 10) }}>{title}</div>
        <Legend rooms={rooms} printers={printers} frame={frame} at={starts[1] ?? 20} />
      </div>
      {/* plan */}
      <div style={{ position: "absolute", left: PLAN.x, top: PLAN.y, width: PLAN.w, height: PLAN.h, overflow: "hidden", borderRadius: 10,
        border: `1px solid ${C.line}`, background: C.soft, opacity: planIn }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: PLAN.w, height: PLAN.h, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${z})` }}>
          <FloorSvg floor={floor} frame={frame} showAt={showAt} heroId={heroId} uid={`p${floor}`} z={z} />
          {pts.map((p) => {
            const sa = showAt(p.id);
            if (sa === null) return null;
            return <Marker key={p.id} p={p} frame={frame} z={z} showAt={sa} labelAt={labelAt(p.id)} hero={heroId === p.id} ps={PLAN.w / 2000} />;
          })}
        </div>
      </div>
      <Subtitle text={s.beats[i].text} />
      {intro ? null : null}
    </AbsoluteFill>
  );
};

const Hook: React.FC<{ s: SceneDef }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { starts, i } = useBeat(s, frame);
  const line = (k: number, big: string, small: string, color: string) => {
    const a = appear(frame, starts[k], 12);
    return (
      <div style={{ opacity: a, transform: `translateY(${(1 - a) * 22}px)`, marginBottom: 26 }}>
        <div style={{ fontSize: 108, fontWeight: 800, color, letterSpacing: "-0.04em", lineHeight: 1 }}>{big}</div>
        <div style={{ fontSize: 26, color: C.muted, marginTop: 8 }}>{small}</div>
      </div>
    );
  };
  const close = appear(frame, starts[2], 14);
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily }}>
      <TopBar right="Office guide" />
      <div style={{ position: "absolute", left: M, top: 190, width: 700 }}>
        {line(0, "Meeting room?", "Right now.", C.navy)}
        {line(1, "Printer?", "Where is it?", C.navy)}
        <div style={{ opacity: close, transform: `translateY(${(1 - close) * 14}px)`, marginTop: 44 }}>
          <div style={{ height: 3, width: 72, background: C.accent, marginBottom: 20 }} />
          <div style={{ fontSize: 44, fontWeight: 600, color: C.ink, letterSpacing: "-0.02em" }}>One minute. That's all.</div>
        </div>
      </div>
      <PlanPane s={s} frame={frame} i={i} starts={starts} />
      <Subtitle text={s.beats[i].text} />
    </AbsoluteFill>
  );
};

// plan pane for the hook (right side, gentle push-in)
const PlanPane: React.FC<{ s: SceneDef; frame: number; i: number; starts: number[] }> = ({ s, frame, i, starts }) => {
  const z = 1 + frame * 0.0004;
  const pts = F15.filter((p) => p.id === "r11" || p.id === "p3");
  const w = 1000, h = 562;
  return (
    <div style={{ position: "absolute", right: M, top: 190, width: w, height: h, overflow: "hidden", borderRadius: 10, border: `1px solid ${C.line}`, opacity: appear(frame, 6, 16) }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: "50% 50%" }}>
        <FloorSvg floor="15" frame={frame} showAt={(id) => (id === "r11" ? starts[0] : null)} heroId={s.beats[i].hero} uid="hook" z={z} />
        {pts.map((p) => {
          const st = p.id === "r11" ? starts[0] : starts[1];
          return <Marker key={p.id} p={p} frame={frame} z={z} showAt={st} labelAt={null} hero={s.beats[i].hero === p.id} ps={w / 2000} />;
        })}
      </div>
    </div>
  );
};

const Overview: React.FC<{ s: SceneDef }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { starts, i } = useBeat(s, frame);
  const floors = [
    { n: "15", img: "floor15", t: "Maersk in Vietnam", r: 11, p: 3 },
    { n: "16", img: "floor16", t: "Integrating the world", r: 8, p: 2 },
    { n: "17", img: "floor17", t: "Triple-E class vessel", r: 8, p: 5 },
  ];
  const cardW = 536, gap = 36;
  const cnt = (target: number, start: number) => Math.round(target * appear(frame, start, 26));
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily }}>
      <TopBar right="Sofic Tower · 3 floors" />
      <div style={{ position: "absolute", left: M, top: 150, fontSize: 56, fontWeight: 800, color: C.navy, letterSpacing: "-0.035em", opacity: appear(frame, 4) }}>
        Three floors, one guide.
      </div>
      <div style={{ position: "absolute", left: M, top: 270, display: "flex", gap }}>
        {floors.map((f, k) => {
          const a = appear(frame, starts[1] + k * 10, 14);
          const a0 = k === 0 ? Math.max(a, appear(frame, starts[0] + 4, 14)) : a;
          return (
            <div key={f.n} style={{ width: cardW, opacity: a0, transform: `translateY(${(1 - a0) * 24}px)` }}>
              <div style={{ width: cardW, height: cardW * 0.5625, overflow: "hidden", borderRadius: 8, border: `1px solid ${C.line}` }}>
                <FloorSvg floor={f.n as "15" | "16" | "17"} frame={frame} showAt={() => starts[2]} uid={`ov${k}`} labels={false} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 16 }}>
                <span style={{ fontSize: 56, fontWeight: 800, color: C.navy, letterSpacing: "-0.04em" }}>{f.n}</span>
                <span style={{ fontSize: 22, color: C.muted }}>{f.t}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: M, top: 770, display: "flex", gap: 90, alignItems: "baseline" }}>
        <div style={{ opacity: appear(frame, starts[2], 12) }}>
          <span style={{ fontSize: 120, fontWeight: 800, color: C.navy, letterSpacing: "-0.05em", lineHeight: 1 }}>{cnt(27, starts[2])}</span>
          <span style={{ fontSize: 28, color: C.ink, marginLeft: 16 }}>meeting rooms</span>
        </div>
        <div style={{ opacity: appear(frame, starts[2] + 10, 12) }}>
          <span style={{ fontSize: 120, fontWeight: 800, color: C.accent, letterSpacing: "-0.05em", lineHeight: 1 }}>{cnt(10, starts[2] + 10)}</span>
          <span style={{ fontSize: 28, color: C.ink, marginLeft: 16 }}>printers</span>
        </div>
      </div>
      <Subtitle text={s.beats[i].text} />
    </AbsoluteFill>
  );
};

const typed = (full: string, frame: number, start: number, cps = 26) =>
  full.slice(0, Math.max(0, Math.min(full.length, Math.floor(((frame - start) / FPS) * cps))));

const Booking: React.FC<{ s: SceneDef }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { starts, i } = useBeat(s, frame);
  const path = "+R VNSGN16 L15 Lotus -15.11 16Pax Teams VC";
  const typedTxt = typed(path, frame, starts[1] + 6, 24);
  const ipad = appear(frame, starts[2], 16);
  const badge = appear(frame, starts[3], 12);
  const Row: React.FC<{ k: string; v?: string; active?: boolean; children?: React.ReactNode }> = ({ k, v, active, children }) => (
    <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${C.line}`, padding: "28px 0", gap: 20 }}>
      <div style={{ width: 120, fontSize: 18, color: C.muted, fontWeight: 600 }}>{k}</div>
      <div style={{ flex: 1, fontSize: 22, color: C.ink, minHeight: 30, display: "flex", alignItems: "center",
        ...(active ? { borderBottom: `2px solid ${C.accent}`, paddingBottom: 4 } : {}) }}>{children ?? v}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily }}>
      <TopBar right="How to book" />
      <div style={{ position: "absolute", left: M, top: 250, width: 520 }}>
        <div style={{ fontSize: 76, fontWeight: 800, color: C.navy, letterSpacing: "-0.04em", lineHeight: 1, opacity: appear(frame, 4) }}>Book a room.</div>
        <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 22 }}>
          {[{ n: "1", t: "Outlook", d: "Paste the room name into Location", at: starts[1] }, { n: "2", t: "iPad panel", d: "At the door of every room", at: starts[2] }].map((o) => (
            <div key={o.n} style={{ opacity: appear(frame, o.at, 12), transform: `translateX(${(1 - appear(frame, o.at, 12)) * -16}px)`, display: "flex", gap: 18, alignItems: "baseline" }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: C.accent, width: 32 }}>{o.n}</span>
              <span><div style={{ fontSize: 30, fontWeight: 600, color: C.ink }}>{o.t}</div><div style={{ fontSize: 20, color: C.muted, marginTop: 4 }}>{o.d}</div></span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 44, opacity: badge, transform: `translateY(${(1 - badge) * 10}px)`, display: "inline-block", padding: "10px 18px", borderRadius: 6, background: C.navy, color: "#fff", fontSize: 22, fontWeight: 600 }}>
          Teams VC in every room
        </div>
      </div>
      {/* outlook-like form (generic, not branded) */}
      <div style={{ position: "absolute", left: 700, top: 250, width: 760, borderRadius: 10, border: `1px solid ${C.line}`, background: "#fff",
        boxShadow: "0 10px 30px rgba(0,62,94,.10)", padding: "10px 32px 18px", opacity: appear(frame, starts[1] - 10, 14) }}>
        <Row k="Title" v="Weekly sync" />
        <Row k="Required" v="team@" />
        <Row k="Location" active={frame >= starts[1] && frame < starts[2] + 40}>
          <span style={{ fontWeight: 600, color: C.navy }}>{typedTxt}</span>
          {typedTxt.length < path.length && frame >= starts[1] && <span style={{ width: 2, height: 26, background: C.navy, marginLeft: 2, opacity: Math.floor(frame / 8) % 2 }} />}
        </Row>
        <Row k="Time" v="10:00 – 11:00" />
      </div>
      {/* iPad */}
      <div style={{ position: "absolute", left: 1540, top: 300, width: 284, height: 380, borderRadius: 26, background: C.navy, padding: 14, boxSizing: "border-box",
        opacity: ipad, transform: `translateY(${(1 - ipad) * 30}px)` }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 14, background: "#fff", padding: 22, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase" }}>Board room</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: C.navy, letterSpacing: "-0.03em", marginTop: 6 }}>Lotus</div>
            <div style={{ fontSize: 20, color: C.ink, marginTop: 6 }}>16 people</div>
          </div>
          <div style={{ height: 6, background: C.accent, borderRadius: 3 }} />
        </div>
      </div>
      <Subtitle text={s.beats[i].text} />
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ s: SceneDef }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { starts, i } = useBeat(s, frame);
  const q = "Lotus";
  const typedQ = typed(q, frame, starts[1] + 8, 6);
  const res = appear(frame, starts[1] + 40, 14);
  const mail = appear(frame, starts[2], 14);
  const end = appear(frame, starts[3], 14);
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily }}>
      <TopBar right="Interactive map" />
      <div style={{ position: "absolute", left: M, top: 190, fontSize: 76, fontWeight: 800, color: C.navy, letterSpacing: "-0.04em", lineHeight: 1.02, width: 700, opacity: appear(frame, 4) }}>
        Find it<br />in seconds.
      </div>
      <div style={{ position: "absolute", left: 900, top: 200, width: 860, opacity: appear(frame, starts[1] - 6, 14) }}>
        <div style={{ border: `1px solid #D7E3E9`, borderRadius: 12, padding: "18px 22px", fontSize: 26, color: typedQ ? C.ink : "#8A9AA2", boxShadow: typedQ ? `0 0 0 4px rgba(66,176,213,.18)` : "none", borderColor: typedQ ? C.accent : "#D7E3E9" }}>
          {typedQ || "Search room or printer…"}
        </div>
        <div style={{ marginTop: 14, opacity: res, transform: `translateY(${(1 - res) * 10}px)`, border: `1px solid ${C.line}`, borderRadius: 12, padding: "16px 22px", display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ width: 30, height: 30, borderRadius: "50%", background: C.navy, flex: "0 0 auto" }} />
          <span><div style={{ fontSize: 24, fontWeight: 600, color: C.ink }}>Lotus</div><div style={{ fontSize: 18, color: C.muted }}>Board room · 16 pax</div></span>
        </div>
      </div>
      <div style={{ position: "absolute", left: M, top: 640, opacity: mail, transform: `translateY(${(1 - mail) * 14}px)` }}>
        <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted }}>Need help?</div>
        <div style={{ fontSize: 48, fontWeight: 600, color: C.ink, marginTop: 8, letterSpacing: "-0.02em" }}>VNADM@maersk.com</div>
      </div>
      <div style={{ position: "absolute", right: M, bottom: 140, fontSize: 36, fontWeight: 800, color: C.accent, letterSpacing: "-0.02em", opacity: end }}>
        Happy meetings. Fast printing.
      </div>
      <Subtitle text={s.beats[i].text} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- composition
export const VnsgnGuide: React.FC = () => {
  let from = 0;
  const fadeIO = (len: number, children: React.ReactNode) => <FadeWrap len={len}>{children}</FadeWrap>;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {SCENES.map((s) => {
        const len = sceneFrames(s);
        const start = from;
        from += len;
        let body: React.ReactNode = null;
        if (s.key === "S1") body = <Hook s={s} />;
        if (s.key === "S2") body = <Overview s={s} />;
        if (s.key === "S3") body = <PlanScene s={s} floor="15" pts={F15} num="15" title="Maersk in Vietnam" rooms={11} printers={3} />;
        if (s.key === "S4") body = <PlanScene s={s} floor="16" pts={F16} num="16" title="Integrating the world" rooms={8} printers={2} />;
        if (s.key === "S5") body = <PlanScene s={s} floor="17" pts={F17} num="17" title="Triple-E class vessel" rooms={8} printers={5} />;
        if (s.key === "S6") body = <Booking s={s} />;
        if (s.key === "S7") body = <Outro s={s} />;
        return (
          <Sequence key={s.key} from={start} durationInFrames={len}>
            {fadeIO(len, body)}
            <Sequence from={LEAD}><Audio src={staticFile(`vnsgn16/${s.key}.wav`)} /></Sequence>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const FadeWrap: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 6, len - 6, len], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
