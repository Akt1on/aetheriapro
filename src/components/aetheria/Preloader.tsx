import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const LETTERS = "AETHERIA".split("");
const KEY = "aetheria-intro-seen";

export function Preloader() {
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === "1"; } catch { seen = false; }
    if (reduced || seen) return;

    setActive(true);
    document.body.style.overflow = "hidden";

    const start = performance.now();
    const DUR = 2200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / DUR);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        try { sessionStorage.setItem(KEY, "1"); } catch { /* noop */ }
        setTimeout(() => {
          setActive(false);
          document.body.style.overflow = "";
          window.dispatchEvent(new Event("aetheria:intro-done"));
        }, 420);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-background"
          exit={{ clipPath: "inset(0% 0% 100% 0%)", opacity: 1 }}
          transition={{ duration: 1.05, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* cinematic light */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle, oklch(0.55 0.24 300 / 45%) 0%, oklch(0.6 0.18 220 / 18%) 45%, transparent 70%)" }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.15, 1], opacity: [0, 0.9, 0.65] }}
            transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
          />
          {/* sweeping light ray */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-[38%] skew-x-[-14deg]"
            style={{ background: "linear-gradient(90deg, transparent, oklch(0.95 0.05 280 / 12%), transparent)" }}
            initial={{ x: "-60vw" }}
            animate={{ x: "120vw" }}
            transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1], delay: 0.35 }}
          />

          <div className="relative flex items-baseline gap-[0.06em] px-6">
            {LETTERS.map((l, i) => (
              <motion.span
                key={`${l}-${i}`}
                initial={{ y: "110%", opacity: 0, filter: "blur(14px)" }}
                animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 1, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block text-[13vw] font-light leading-none tracking-[0.12em] text-white sm:text-[7vw]"
                style={{ textShadow: "0 0 60px oklch(0.7 0.24 300 / 45%)" }}
              >
                {l}
              </motion.span>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="relative mt-8 flex w-[min(320px,70vw)] flex-col items-center gap-3"
          >
            <div className="h-px w-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-violet via-cyan to-gold"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex w-full items-center justify-between text-[10px] uppercase tracking-[0.35em] text-white/40">
              <span>Digital worlds that feel</span>
              <span className="tabular-nums text-white/70">{progress}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
