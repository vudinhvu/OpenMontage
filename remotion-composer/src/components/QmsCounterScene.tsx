import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";

/**
 * QmsCounterScene - synthetic QMS counter-agent screen (FAKE data only).
 * One component, one `variant` per scene of the "QMS Counter Agent Guide" video.
 * All animation is derived from local time `t` (seconds since scene start).
 */

export type QmsVariant =
  | "intro"
  | "overview"
  | "callnext"
  | "oneatatime"
  | "recall"
  | "pause"
  | "walkin"
  | "priority"
  | "transfercancel"
  | "complete"
  | "recap";

interface Ticket { n: string; name: string; svc: string; bl: string; be: string; docs: number; arrived: string; phone: string }

// Fake data only (no real customers).
const T: Ticket[] = [
  { n: "MDO-012", name: "Alpha Trading Ltd", svc: "DO Issuance", bl: "HDM0001234", be: "BE-10021", docs: 2, arrived: "10:30", phone: "01700-000012" },
  { n: "MDO-013", name: "Bright Logistics", svc: "DO Issuance", bl: "HDM0001301", be: "BE-10034", docs: 1, arrived: "10:34", phone: "01700-000013" },
  { n: "MDO-014", name: "Coastal Imports", svc: "DO Issuance", bl: "HDM0001377", be: "BE-10047", docs: 3, arrived: "10:41", phone: "01700-000014" },
  { n: "MDO-015", name: "Delta Shipping", svc: "DO Issuance", bl: "HDM0001402", be: "BE-10052", docs: 1, arrived: "10:47", phone: "01700-000015" },
  { n: "MDO-016", name: "Walk-in customer", svc: "DO Issuance", bl: "-", be: "-", docs: 0, arrived: "10:52", phone: "-" },
  { n: "MDO-011", name: "Evergreen Traders", svc: "DO Issuance", bl: "HDM0001190", be: "BE-09981", docs: 2, arrived: "10:12", phone: "01700-000011" },
];

const C = {
  bar: "#3FA9D6", navy: "#0B2A3D", green: "#6AA420", purple: "#7C3AED", amber: "#F59E0B", red: "#DC2626",
  text: "#1F2937", muted: "#6B7280", line: "#E5E7EB", bg: "#F3F6F9", card: "#FFFFFF", blue: "#2563EB",
};
const FONT = "Inter, 'Segoe UI', Arial, sans-serif";

// Target centres (design space 1920x1080)
const BTN_Y = 540;
const TARGET: Record<string, [number, number]> = {
  counter: [95, 98],
  pause: [95, BTN_Y], recall: [214, BTN_Y], transfer: [333, BTN_Y], cancel: [452, BTN_Y], walkin: [571, BTN_Y], delete: [690, BTN_Y],
  callnext: [213, 652], complete: [571, 652],
  tabwait: [990, 88], tabpending: [1360, 88], tabdone: [1710, 88],
  submit: [690, 735],
};
const rowTop = (i: number) => 210 + i * 116;

const ramp = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
const win = (t: number, a: number, b: number, f = 0.25) => ramp(t, a, a + f) * (1 - ramp(t, b - f, b));

interface Ann { id: string; label?: string; a: number; b: number }
interface View {
  serving: number | null; servingK: number;
  waiting: number[]; pending: number[]; done: number[];
  tab: "wait" | "pending" | "done";
  press?: { id: string; at: number };
  anns: Ann[];
  cursor?: { t: number; id?: string; xy?: [number, number] }[];
  dimCallNext?: boolean;
  badge?: { text: string; a: number; b: number };
  callout?: { text: string; a: number; b: number };
  rowAnns?: { row: number; icon: "transfer" | "priority" | "cancel" | "resume"; label: string; a: number; b: number }[];
  modal?: { a: number; b: number };
  kiosk?: { a: number; b: number };
  newRow?: { idx: number; at: number };
  stamp?: { text: string; a: number; b: number };
  ripple?: { a: number; b: number };
  popover?: { text: string; a: number; b: number };
}

function build(v: QmsVariant, t: number): View {
  const base: View = { serving: null, servingK: 1, waiting: [1, 2, 3], pending: [], done: [5], tab: "wait", anns: [] };
  switch (v) {
    case "overview": {
      const tab = t < 8.7 ? "wait" : t < 11.7 ? "pending" : "done";
      return { ...base, waiting: [0, 1, 2, 3], tab, anns: [
        { id: "counter", label: "Your counter number", a: 1.6, b: 4.4 },
        { id: "tabwait", label: "Waiting Queue", a: 6.0, b: 8.3 },
        { id: "tabpending", label: "Pending Jobs", a: 8.5, b: 11.2 },
        { id: "tabdone", label: "Completed", a: 11.6, b: 14.9 },
      ] };
    }
    case "callnext": {
      const on = t >= 4.0;
      return { ...base, waiting: on ? [1, 2, 3] : [0, 1, 2, 3], serving: on ? 0 : null, servingK: ramp(t, 4.0, 4.6),
        anns: [{ id: "callnext", label: "Call Next", a: 2.7, b: 4.2 }],
        press: { id: "callnext", at: 3.6 },
        cursor: [{ t: 0.4, xy: [900, 760] }, { t: 3.4, id: "callnext" }, { t: 12, id: "callnext" }],
        badge: on ? { text: "Waiting  →  Being Served", a: 7.3, b: 12 } : undefined };
    }
    case "oneatatime":
      return { ...base, serving: 0, dimCallNext: true,
        anns: [{ id: "callnext", label: "Busy: complete this ticket first", a: 3.0, b: 6.2 }],
        callout: { text: "One ticket at a time per counter", a: 0.4, b: 6.2 } };
    case "recall":
      return { ...base, serving: 0,
        anns: [{ id: "recall", label: "Recall", a: 1.8, b: 3.1 }],
        press: { id: "recall", at: 2.9 },
        cursor: [{ t: 0.3, xy: [900, 800] }, { t: 2.7, id: "recall" }, { t: 8, id: "recall" }],
        ripple: { a: 3.0, b: 7.6 }, callout: { text: "Same ticket is called again", a: 3.8, b: 7.6 } };
    case "pause": {
      const back = t >= 11.0;
      const serving = t < 3.9 || back ? 0 : null;
      const tab = t < 5.6 ? "wait" : t < 12.0 ? "pending" : "wait";
      return { ...base, serving, servingK: back ? ramp(t, 11.0, 11.6) : 1,
        pending: t >= 3.9 && !back ? [0] : [], tab,
        anns: [{ id: "pause", label: "Pause", a: 2.4, b: 3.7 }],
        rowAnns: tab === "pending" && !back ? [{ row: 0, icon: "resume", label: "Resume", a: 9.0, b: 10.9 }] : [],
        press: t < 6 ? { id: "pause", at: 3.5 } : undefined,
        cursor: [{ t: 0.5, xy: [900, 800] }, { t: 3.3, id: "pause" }, { t: 5.5, id: "tabpending" }, { t: 10.3, xy: [1815, rowTop(0) + 52] }, { t: 15, xy: [1815, rowTop(0) + 52] }],
        badge: t >= 4.3 && t < 8 ? { text: "Ticket moved to Pending Jobs", a: 4.3, b: 8 } : undefined };
    }
    case "walkin": {
      const added = t >= 10.5;
      return { ...base, waiting: added ? [1, 2, 3, 4] : [1, 2, 3],
        anns: [{ id: "walkin", label: "Walk-in", a: 4.9, b: 6.4 }],
        press: { id: "walkin", at: 6.0 },
        cursor: [{ t: 0.5, xy: [900, 820] }, { t: 5.8, id: "walkin" }, { t: 9.9, id: "submit" }, { t: 15, id: "submit" }],
        kiosk: { a: 3.0, b: 5.6 }, modal: { a: 6.6, b: 10.4 }, newRow: { idx: 4, at: 10.5 },
        callout: { text: "The customer does nothing", a: 8.4, b: 10.4 } };
    }
    case "priority": {
      const jumped = t >= 6.6;
      return { ...base, waiting: jumped ? [1, 2] : [1, 2, 3], serving: jumped ? 3 : null, servingK: ramp(t, 6.6, 7.2),
        rowAnns: !jumped ? [{ row: 2, icon: "priority", label: "Priority", a: 4.6, b: 6.5 }] : [],
        cursor: [{ t: 0.5, xy: [1000, 900] }, { t: 6.2, xy: [1745, rowTop(2) + 52] }, { t: 15, xy: [1745, rowTop(2) + 52] }],
        badge: jumped ? { text: "Called out of queue order", a: 7.4, b: 11.6 } : undefined,
        callout: t >= 11.8 ? { text: "Everyone else must wait", a: 11.8, b: 15 } : undefined };
    }
    case "transfercancel": {
      const cancelled = t >= 9.9;
      return { ...base, serving: cancelled ? null : 0, servingK: 1,
        anns: [{ id: "transfer", label: "Transfer", a: 2.2, b: 3.2 }, { id: "cancel", label: "Cancel", a: 6.8, b: 8.0 }],
        popover: { text: "Transfer to:  Counter 2", a: 3.0, b: 6.4 },
        press: t > 5 ? { id: "cancel", at: 7.9 } : { id: "transfer", at: 3.0 },
        cursor: [{ t: 0.4, xy: [900, 800] }, { t: 2.9, id: "transfer" }, { t: 7.7, id: "cancel" }, { t: 12, id: "cancel" }],
        stamp: { text: "CANCELLED", a: 8.2, b: 10.4 } };
    }
    case "complete": {
      const done = t >= 2.6;
      const tab = t < 4.2 ? "wait" : "done";
      return { ...base, serving: done ? null : 0, done: done ? [0, 5] : [5], tab,
        anns: [{ id: "complete", label: "Complete", a: 1.0, b: 2.5 }, { id: "callnext", label: "Ready for the next customer", a: 7.6, b: 11.8 }],
        press: { id: "complete", at: 2.2 },
        cursor: [{ t: 0.4, xy: [900, 820] }, { t: 2.0, id: "complete" }, { t: 7.9, id: "callnext" }, { t: 13, id: "callnext" }],
        badge: done ? { text: "Moved to Completed", a: 3.2, b: 7.2 } : undefined };
    }
    default:
      return base;
  }
}

const Label: React.FC<{ x: number; y: number; text: string; k: number; dir?: "up" | "down" }> = ({ x, y, text, k, dir = "up" }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, ${dir === "up" ? "-135%" : "55%"}) scale(${0.9 + 0.1 * k})`, opacity: k, zIndex: 50 }}>
    <div style={{ background: C.amber, color: C.text, fontWeight: 800, fontSize: 28, padding: "10px 22px", borderRadius: 12, whiteSpace: "nowrap", boxShadow: "0 6px 18px rgba(0,0,0,0.18)" }}>{text}</div>
  </div>
);

const Icon: React.FC<{ kind: string; size?: number; color?: string }> = ({ kind, size = 40, color = C.text }) => {
  const p = { stroke: color, strokeWidth: 2.4, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {kind === "transfer" && <path {...p} d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4" />}
      {kind === "priority" && <path {...p} d="M12 20V5M6 11l6-6 6 6" />}
      {kind === "cancel" && <><circle {...p} cx="12" cy="12" r="9" /><path {...p} d="M9 9l6 6M15 9l-6 6" /></>}
      {kind === "resume" && <path {...p} d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5" />}
      {kind === "pause" && <><circle {...p} cx="12" cy="12" r="9" /><path {...p} d="M12 7v5l3 2" /></>}
      {kind === "recall" && <path {...p} d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0" />}
      {kind === "walkin" && <><rect {...p} x="4" y="5" width="14" height="14" rx="2" /><path {...p} d="M18 8h3M19.5 6.5v3" /></>}
      {kind === "delete" && <path {...p} d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13" />}
    </svg>
  );
};

const ring = (k: number, extra = 4) => (k > 0 ? `0 0 0 ${extra + k * 5}px rgba(245,158,11,${0.9 * k})` : undefined);

const Row: React.FC<{ i: number; tk: Ticket; icons: ("transfer" | "priority" | "cancel")[]; hlIcon?: { icon: string; k: number }; resume?: boolean; flash?: number; wait: string }> = ({ i, tk, icons, hlIcon, resume, flash = 0, wait }) => (
  <div style={{ position: "absolute", left: 800, top: rowTop(i), width: 1076, height: 104, background: C.card, borderRadius: 14,
    border: `2px solid ${flash > 0 ? C.amber : C.line}`, boxShadow: flash > 0 ? `0 0 0 ${flash * 8}px rgba(245,158,11,0.35)` : "0 2px 6px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", padding: "0 20px", gap: 22 }}>
    <div style={{ background: resume ? "#B91C1C" : C.bar, color: "#fff", fontWeight: 800, fontSize: 28, padding: "10px 16px", borderRadius: 10, minWidth: 150, textAlign: "center" }}>{tk.n}</div>
    <div style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.text }}>{tk.name} <span style={{ fontSize: 17, background: "#EEF2F7", padding: "2px 8px", borderRadius: 6, marginLeft: 6, color: C.muted, fontWeight: 600 }}>Sample Shipping Co.</span></div>
      <div style={{ fontSize: 20, color: C.muted, marginTop: 6 }}><span style={{ color: C.bar, fontWeight: 700 }}>{"•"} {tk.svc}</span> &nbsp; BL: <b style={{ color: C.blue }}>{tk.bl}</b> &nbsp; BE: <b style={{ color: "#B45309" }}>{tk.be}</b> &nbsp; Docs: {tk.docs}</div>
    </div>
    <div style={{ textAlign: "center", marginRight: 12 }}><div style={{ fontSize: 16, color: C.muted, fontWeight: 700 }}>WAIT</div><div style={{ fontSize: 24, fontWeight: 800, color: C.blue }}>{wait}</div></div>
    <div style={{ display: "flex", gap: 22, width: 200, justifyContent: "flex-end" }}>
      {resume && <div style={{ borderRadius: 10, padding: 4, boxShadow: hlIcon ? ring(hlIcon.k) : undefined }}><Icon kind="resume" size={44} /></div>}
      {icons.map((ic) => (
        <div key={ic} style={{ borderRadius: 10, padding: 4, boxShadow: hlIcon?.icon === ic ? ring(hlIcon.k) : undefined }}><Icon kind={ic} size={44} /></div>
      ))}
    </div>
  </div>
);

export const QmsCounterScene: React.FC<{ variant: QmsVariant }> = ({ variant }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  if (variant === "intro") return <Intro t={t} />;
  if (variant === "recap") return <Recap t={t} />;

  const v = build(variant, t);
  const hlK = (id: string) => v.anns.filter((a) => a.id === id).reduce((m, a) => Math.max(m, win(t, a.a, a.b)), 0);
  const pressK = (id: string) => (v.press && v.press.id === id ? 1 - 0.06 * Math.max(0, 1 - Math.abs(t - v.press.at - 0.1) / 0.22) : 1);

  const btn = (id: string, label: string, i: number) => {
    const k = hlK(id);
    return (
      <div key={id} style={{ position: "absolute", left: 40 + i * 119, top: 500, width: 109, height: 80, background: "#fff", border: `2px solid ${C.bar}`, borderRadius: 10,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.bar, fontWeight: 800, fontSize: 17, gap: 2,
        transform: `scale(${pressK(id)})`, boxShadow: ring(k) }}>
        <Icon kind={id} size={26} color={C.bar} />
        <span>{label}</span>
      </div>
    );
  };

  const serving = v.serving !== null ? T[v.serving] : null;
  const elapsed = `00:${String(Math.floor(12 + t)).padStart(2, "0")}`;
  const cursor = v.cursor ? cursorPos(v.cursor, t) : null;
  const listFor = v.tab === "wait" ? v.waiting : v.tab === "pending" ? v.pending : v.done;
  const countW = v.waiting.length + (variant === "overview" ? 219 : 0);

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 40, background: "#fff", borderBottom: `4px solid ${C.bar}`, color: C.text, fontSize: 20, display: "flex", alignItems: "center", paddingLeft: 60 }}>QMS Counter 1 &nbsp;|&nbsp; Sample site (demo data)</div>

      <div style={{ position: "absolute", left: 24, top: 56, width: 736, height: 850, background: "#fff", borderRadius: 16, border: `3px solid ${C.bar}` }} />
      <div style={{ position: "absolute", left: 40, top: 70, width: 110, height: 56, border: `2px solid ${C.line}`, borderRadius: 8, fontSize: 28, display: "flex", alignItems: "center", paddingLeft: 16, color: C.text, boxShadow: ring(hlK("counter")) }}>1 &nbsp;&#9662;</div>

      <div style={{ position: "absolute", left: 40, top: 150, width: 704, height: 320, background: serving ? "#EAF6FC" : "#F3F6F9", borderRadius: 14, border: `2px solid ${C.line}`, overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 800, color: C.muted, background: serving ? "#D9EEF9" : "#E8EDF2" }}>
          <span><span style={{ color: serving ? "#10B981" : C.muted }}>{"●"}</span> {serving ? "NOW SERVING" : "COUNTER IDLE"} &nbsp; COUNTER 01</span>
          {serving ? <span style={{ color: C.blue }}>ELAPSED {elapsed}</span> : <span>STATUS &nbsp; <b style={{ color: C.text }}>READY</b></span>}
        </div>
        {serving ? (
          <div style={{ padding: "10px 24px", transform: `translateX(${(1 - v.servingK) * 80}px)`, opacity: v.servingK }}>
            <div style={{ fontSize: 66, fontWeight: 900, color: C.navy }}><span style={{ color: C.bar, fontSize: 38 }}>MDO-</span>{serving.n.slice(4)}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.text, marginTop: 2 }}>{serving.name}</div>
            <div style={{ fontSize: 22, color: C.bar, fontWeight: 700 }}>{serving.svc}</div>
            <div style={{ display: "flex", gap: 28, marginTop: 16, fontSize: 22, color: C.muted }}>
              <div>B/L <b style={{ color: C.text }}>{serving.bl}</b></div><div>B/E <b style={{ color: C.text }}>{serving.be}</b></div><div>Docs <b style={{ color: C.blue }}>{serving.docs}</b></div><div>Arrived <b style={{ color: "#B45309" }}>{serving.arrived}</b></div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "24px 26px" }}>
            <div style={{ fontSize: 38, color: "#94A3B8" }}>No customer at this counter</div>
            <div style={{ fontSize: 22, color: C.muted, marginTop: 10 }}>Ready for your next call.</div>
          </div>
        )}
        {v.stamp && <div style={{ position: "absolute", left: 160, top: 130, transform: `rotate(-10deg) scale(${0.8 + 0.2 * win(t, v.stamp.a, v.stamp.b)})`, opacity: win(t, v.stamp.a, v.stamp.b), border: `8px solid ${C.red}`, color: C.red, fontWeight: 900, fontSize: 60, padding: "6px 24px", borderRadius: 12 }}>{v.stamp.text}</div>}
        {v.ripple && [0, 1, 2].map((r) => { const k = ((((t - v.ripple!.a - r * 0.7) % 2.1) + 2.1) % 2.1) / 2.1; const on = win(t, v.ripple!.a, v.ripple!.b); const s = 120 + k * 360; return <div key={r} style={{ position: "absolute", left: 350 - s / 2, top: 180 - s / 2, width: s, height: s, borderRadius: "50%", border: `5px solid ${C.bar}`, opacity: (1 - k) * 0.7 * on }} />; })}
      </div>

      {btn("pause", "PAUSE", 0)}{btn("recall", "RECALL", 1)}{btn("transfer", "TRANSFER", 2)}{btn("cancel", "CANCEL", 3)}{btn("walkin", "WALK-IN", 4)}{btn("delete", "DELETE", 5)}
      <div style={{ position: "absolute", left: 40, top: 610, width: 346, height: 84, background: C.bar, color: "#fff", borderRadius: 10, fontWeight: 800, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", opacity: v.dimCallNext ? 0.45 : 1,
        transform: `scale(${pressK("callnext")})`, boxShadow: ring(hlK("callnext"), 6) }}>{"➤"} &nbsp;CALL NEXT</div>
      <div style={{ position: "absolute", left: 398, top: 610, width: 346, height: 84, background: C.green, color: "#fff", borderRadius: 10, fontWeight: 800, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${pressK("complete")})`, boxShadow: ring(hlK("complete"), 6) }}>{"✔"} &nbsp;COMPLETE</div>

      {v.kiosk && <div style={{ position: "absolute", left: 120, top: 740, width: 540, height: 130, background: "#fff", border: `3px dashed ${C.muted}`, borderRadius: 16, opacity: win(t, v.kiosk.a, v.kiosk.b), display: "flex", alignItems: "center", justifyContent: "center", gap: 20, fontSize: 38, fontWeight: 800, color: C.muted }}>
        Kiosk ticket
        <div style={{ position: "absolute", left: 20, right: 20, top: 70, height: 10, background: C.red, transform: "rotate(-8deg)", borderRadius: 5 }} /></div>}
      {v.popover && <div style={{ position: "absolute", left: 120, top: 740, width: 540, height: 100, background: "#fff", border: `3px solid ${C.bar}`, borderRadius: 16, opacity: win(t, v.popover.a, v.popover.b), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 800, color: C.navy }}>{v.popover.text}</div>}
      {v.callout && <div style={{ position: "absolute", left: 80, top: 780, width: 620, padding: "18px 28px", background: C.navy, color: "#fff", borderRadius: 16, fontSize: 34, fontWeight: 800, textAlign: "center", opacity: win(t, v.callout.a, v.callout.b), transform: `translateY(${(1 - win(t, v.callout.a, v.callout.b)) * 20}px)` }}>{v.callout.text}</div>}
      {v.badge && <div style={{ position: "absolute", left: 80, top: 720, width: 620, textAlign: "center", opacity: win(t, v.badge.a, v.badge.b) }}><div style={{ display: "inline-block", background: C.blue, color: "#fff", borderRadius: 999, fontWeight: 800, fontSize: 30, padding: "10px 26px" }}>{v.badge.text}</div></div>}

      <div style={{ position: "absolute", left: 780, top: 56, width: 1116, height: 850, background: "#fff", borderRadius: 16, border: `3px solid ${C.bar}` }} />
      {[{ k: "wait", x: 800, w: 380, label: "Waiting Queue", n: countW, col: C.navy, id: "tabwait" }, { k: "pending", x: 1170, w: 380, label: "Pending Jobs", n: v.pending.length, col: C.purple, id: "tabpending" }, { k: "done", x: 1560, w: 320, label: "COMPLETED", n: v.done.length, col: C.navy, id: "tabdone" }].map((tb) => {
        const on = v.tab === tb.k;
        return (
          <div key={tb.k} style={{ position: "absolute", left: tb.x, top: 60, width: tb.w, height: 56, borderRadius: 28, background: on ? tb.col : "#EEF2F7", color: on ? "#fff" : C.muted, fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: ring(hlK(tb.id)) }}>
            {tb.label}<span style={{ background: on ? "#fff" : "#CBD5E1", color: on ? tb.col : C.text, borderRadius: 14, padding: "0 12px", fontSize: 22 }}>{tb.n}</span></div>
        );
      })}
      <div style={{ position: "absolute", left: 800, top: 130, width: 420, height: 52, border: `2px solid ${C.line}`, borderRadius: 8, color: "#94A3B8", fontSize: 22, display: "flex", alignItems: "center", paddingLeft: 16 }}>Customer ID or Phone number</div>

      {listFor.length === 0 && <div style={{ position: "absolute", left: 800, top: 380, width: 1076, textAlign: "center", fontSize: 34, color: "#94A3B8" }}>{v.tab === "pending" ? "No pending jobs" : "Queue is empty"}</div>}
      {listFor.map((idx, i) => {
        const tk = T[idx]; const ra = (v.rowAnns || []).find((r) => r.row === i);
        const rk = ra ? win(t, ra.a, ra.b) : 0;
        const isNew = !!v.newRow && v.newRow.idx === idx; const nk = isNew ? ramp(t, v.newRow!.at, v.newRow!.at + 0.5) : 1;
        const flash = isNew ? win(t, v.newRow!.at, v.newRow!.at + 2.2, 0.3) : 0;
        return (
          <div key={tk.n} style={{ opacity: nk, transform: `translateX(${(1 - nk) * 60}px)` }}>
            <Row i={i} tk={tk} icons={v.tab === "wait" ? ["transfer", "priority", "cancel"] : []} resume={v.tab === "pending"}
              hlIcon={ra ? { icon: ra.icon, k: rk } : undefined} flash={flash} wait={v.tab === "pending" ? "739m" : v.tab === "done" ? "done" : `${3 + i * 4}m`} />
            {isNew && flash > 0 && <div style={{ position: "absolute", left: 1010, top: rowTop(i) + 8, background: C.amber, color: C.text, fontWeight: 900, fontSize: 20, padding: "2px 12px", borderRadius: 8, opacity: flash }}>NEW</div>}
          </div>
        );
      })}
      {(v.rowAnns || []).map((ra, k) => { const kk = win(t, ra.a, ra.b); const x = ra.icon === "transfer" ? 1685 : ra.icon === "priority" ? 1745 : 1805; return <Label key={k} x={x} y={rowTop(ra.row) + 52} text={ra.label} k={kk} dir={ra.row < 2 ? "down" : "up"} />; })}
      {variant === "priority" && [0, 1].map((r) => <div key={r} style={{ position: "absolute", left: 1500, top: rowTop(r) + 24, opacity: win(t, 9, 15), fontSize: 26, fontWeight: 800, color: C.red, background: "#FEE2E2", padding: "4px 16px", borderRadius: 10, zIndex: 5 }}>waiting...</div>)}

      {v.anns.map((a, i) => { const k = win(t, a.a, a.b); if (!a.label || k <= 0) return null; const [x, y] = TARGET[a.id]; return <Label key={i} x={x} y={y} text={a.label} k={k} dir={a.id.startsWith("tab") || a.id === "counter" ? "down" : "up"} />; })}

      {v.modal && (() => { const k = win(t, v.modal.a, v.modal.b, 0.35); const typed = (s: string, a: number) => s.slice(0, Math.max(0, Math.floor((t - a) * 14)));
        const field = (label: string, val: string) => (
          <div style={{ width: 316 }}>
            <div style={{ fontSize: 20, color: C.muted }}>{label}</div>
            <div style={{ border: `2px solid ${C.line}`, borderRadius: 8, padding: "4px 12px", fontSize: 26, height: 44, whiteSpace: "nowrap", overflow: "hidden" }}>{val}</div>
          </div>);
        return (
          <div style={{ position: "absolute", left: 40, top: 706, width: 704, height: 178, background: "#fff", borderRadius: 16, border: `3px solid ${C.bar}`, boxShadow: "0 12px 40px rgba(0,0,0,0.25)", opacity: k, transform: `translateY(${(1 - k) * 30}px)`, zIndex: 20, padding: "16px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.navy }}>New walk-in ticket</div>
              <div style={{ background: C.green, color: "#fff", fontWeight: 800, fontSize: 24, padding: "8px 26px", borderRadius: 10,
                boxShadow: t > 9.3 ? `0 0 0 6px rgba(245,158,11,${0.9 * ramp(t, 9.3, 9.6)})` : undefined, transform: `scale(${t > 9.9 && t < 10.2 ? 0.94 : 1})` }}>Create ticket</div>
            </div>
            <div style={{ display: "flex", gap: 28 }}>{field("Customer", typed("Walk-in customer", 7.0))}{field("Service", typed("DO Issuance", 8.4))}</div>
          </div>
        ); })()}

      {cursor && <Cursor x={cursor[0]} y={cursor[1]} />}
    </AbsoluteFill>
  );
};

function cursorPos(path: NonNullable<View["cursor"]>, t: number): [number, number] {
  const pts = path.map((p) => ({ t: p.t, xy: (p.id ? TARGET[p.id] : p.xy) as [number, number] }));
  if (t <= pts[0].t) return pts[0].xy;
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i].t) {
      const k = interpolate(t, [pts[i - 1].t, pts[i].t], [0, 1], { easing: Easing.inOut(Easing.cubic) });
      return [pts[i - 1].xy[0] + (pts[i].xy[0] - pts[i - 1].xy[0]) * k, pts[i - 1].xy[1] + (pts[i].xy[1] - pts[i - 1].xy[1]) * k];
    }
  }
  return pts[pts.length - 1].xy;
}

const Cursor: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg style={{ position: "absolute", left: x - 4, top: y - 4, zIndex: 100, filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))" }} width="44" height="44" viewBox="0 0 24 24">
    <path d="M5 2l14 10-6 1 3.5 7-3 1.5-3.5-7-5 4z" fill="#111827" stroke="#fff" strokeWidth="1.4" />
  </svg>
);

const Intro: React.FC<{ t: number }> = ({ t }) => {
  const q = ramp(t, 6.7, 7.4);
  return (
    <AbsoluteFill style={{ background: "#fff", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 160, top: 360, width: 360, height: 280, background: C.bar, borderRadius: 24, color: "#fff", fontSize: 40, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", opacity: ramp(t, 0, 0.6) }}>Counter 1</div>
      {[0, 1, 2, 3, 4].map((i) => { const k = ramp(t, 2.1 + i * 0.25, 2.5 + i * 0.25); return (
        <div key={i} style={{ position: "absolute", left: 640 + i * 150, top: 440, width: 100, height: 100, borderRadius: "50%", background: "#E0F2FE", border: `5px solid ${C.bar}`, color: C.navy, fontSize: 30, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>{`0${i + 1}`}</div>); })}
      <div style={{ position: "absolute", left: 1500, top: 440, width: 100, height: 100, borderRadius: "50%", background: "#FEF3C7", border: `5px dashed ${C.amber}`, fontSize: 40, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", opacity: ramp(t, 4.2, 4.8), transform: `translateX(${(1 - ramp(t, 4.2, 5.0)) * 120}px)` }}>?</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", fontSize: 76, fontWeight: 900, color: C.navy, opacity: q, transform: `translateY(${(1 - q) * 24}px)` }}>What do you press first?</div>
    </AbsoluteFill>
  );
};

const Recap: React.FC<{ t: number }> = ({ t }) => {
  const core = ["Call Next", "Serve", "Complete"];
  const help = ["Recall", "Pause", "Walk-in", "Priority", "Transfer"];
  return (
    <AbsoluteFill style={{ background: "#fff", fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center", fontSize: 64, fontWeight: 900, color: C.navy, opacity: ramp(t, 0, 0.5) }}>Your counter in QMS</div>
      {core.map((c, i) => { const k = ramp(t, 1.4 + i * 0.8, 1.9 + i * 0.8); return (
        <div key={c} style={{ position: "absolute", left: 200 + i * 520, top: 300, width: 460, height: 190, borderRadius: 20, background: i === 2 ? C.green : C.bar, color: "#fff", fontSize: 54, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>{i + 1}. {c}</div>); })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontSize: 36, color: C.muted, fontWeight: 700, opacity: ramp(t, 4.2, 4.7) }}>When you need them</div>
      {help.map((h, i) => { const k = ramp(t, [5.3, 6.2, 6.8, 7.5, 8.3][i], [5.3, 6.2, 6.8, 7.5, 8.3][i] + 0.4); return (
        <div key={h} style={{ position: "absolute", left: 120 + i * 335, top: 670, width: 300, height: 120, borderRadius: 16, border: `4px solid ${C.bar}`, color: C.bar, fontSize: 38, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", opacity: k, transform: `scale(${0.9 + 0.1 * k})` }}>{h}</div>); })}
    </AbsoluteFill>
  );
};
