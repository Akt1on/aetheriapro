import { useEffect, useState } from "react";

export type Quality = "high" | "medium" | "low";

let cached: Quality | null = null;
const listeners = new Set<(q: Quality) => void>();

function baseline(): Quality {
  if (typeof window === "undefined") return "medium";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "low";

  const mem = nav.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const mobile = window.innerWidth < 768;

  if (mem <= 2 || cores <= 2) return "low";
  if (mobile || mem <= 4 || cores <= 4) return "medium";
  return "high";
}

function publish(q: Quality) {
  if (cached === q) return;
  cached = q;
  listeners.forEach((fn) => fn(q));
}

/** Measures real frame budget once per session and downgrades quality if the device struggles. */
function probeFps() {
  if (typeof window === "undefined") return;
  let frames = 0;
  const start = performance.now();
  const tick = () => {
    frames++;
    const elapsed = performance.now() - start;
    if (elapsed < 1200) {
      requestAnimationFrame(tick);
      return;
    }
    const fps = (frames / elapsed) * 1000;
    const current = cached ?? baseline();
    if (fps < 32) publish("low");
    else if (fps < 50 && current === "high") publish("medium");
  };
  requestAnimationFrame(tick);
}

/**
 * Adaptive visual quality: combines device capabilities with a live FPS probe.
 * Heavy WebGL layers subscribe to this so the site never drops below a smooth feel.
 */
export function useQuality(): Quality {
  const [q, setQ] = useState<Quality>(() => cached ?? "medium");

  useEffect(() => {
    if (cached === null) {
      publish(baseline());
      // probe after first paint settles
      const id = window.setTimeout(probeFps, 1500);
      listeners.add(setQ);
      setQ(cached ?? "medium");
      return () => {
        window.clearTimeout(id);
        listeners.delete(setQ);
      };
    }
    setQ(cached);
    listeners.add(setQ);
    return () => {
      listeners.delete(setQ);
    };
  }, []);

  return q;
}

export const qualityRank: Record<Quality, number> = { low: 0, medium: 1, high: 2 };
export const atLeast = (q: Quality, min: Quality) => qualityRank[q] >= qualityRank[min];
