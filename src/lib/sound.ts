// Tiny Web Audio synth — no assets, no deps. Off by default; user opts in.
const KEY = "aetheria-sound";
let ctx: AudioContext | null = null;
let enabled = false;
const subs = new Set<(v: boolean) => void>();

export function initSound() {
  try { enabled = localStorage.getItem(KEY) === "1"; } catch { enabled = false; }
  subs.forEach((f) => f(enabled));
}
export const isSoundOn = () => enabled;
export function onSound(fn: (v: boolean) => void) { subs.add(fn); return () => { subs.delete(fn); }; }
export function setSound(v: boolean) {
  enabled = v;
  try { localStorage.setItem(KEY, v ? "1" : "0"); } catch { /* noop */ }
  subs.forEach((f) => f(v));
  if (v) { getCtx(); playClick(); }
}

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(f0: number, f1: number, dur: number, vol: number, type: OscillatorType = "sine", delay = 0) {
  if (!enabled) return;
  const c = getCtx(); if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t); o.stop(t + dur + 0.02);
}

export const playHover = () => tone(180, 140, 0.05, 0.03);
export const playClick = () => tone(220, 80, 0.06, 0.07, "triangle");
export const playStep = () => { tone(420, 900, 0.18, 0.035, "sine"); tone(210, 450, 0.18, 0.025, "triangle"); };
export const playSuccess = () => { tone(659, 659, 0.5, 0.06); tone(988, 988, 0.6, 0.05, "sine", 0.08); };
