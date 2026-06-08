import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * A faux-3D "device" composition: rotating orb + floating browser frame +
 * orbiting glyphs. Reacts to mouse via tilt.
 */
export function HeroScene() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 80, damping: 14 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 80, damping: 14 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mx.set((e.clientX - r.left) / r.width - 0.5);
      my.set((e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => { mx.set(0); my.set(0); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [mx, my]);

  return (
    <div ref={ref} className="relative h-[520px] w-full select-none lg:h-[640px]" style={{ perspective: "1400px" }}>
      {/* Aurora orb */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full lg:h-[520px] lg:w-[520px]"
        style={{
          background:
            "conic-gradient(from 120deg, oklch(0.55 0.25 270), oklch(0.7 0.24 300), oklch(0.82 0.16 215), oklch(0.55 0.25 270))",
          filter: "blur(60px)",
          opacity: 0.6,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner glass sphere */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full lg:h-[380px] lg:w-[380px]"
        style={{
          rotateX: rx,
          rotateY: ry,
          background:
            "radial-gradient(circle at 30% 25%, oklch(1 0 0 / 30%), transparent 45%), radial-gradient(circle at 70% 80%, oklch(0.55 0.25 270 / 60%), transparent 50%), linear-gradient(140deg, oklch(0.2 0.06 268), oklch(0.08 0.02 265))",
          boxShadow:
            "inset 0 2px 30px oklch(1 0 0 / 20%), inset 0 -40px 80px oklch(0.55 0.25 270 / 40%), 0 50px 100px -20px oklch(0 0 0 / 80%), 0 0 100px -10px oklch(0.7 0.24 300 / 50%)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* highlight */}
        <div className="absolute left-[18%] top-[12%] h-24 w-24 rounded-full bg-white/40 blur-2xl" />
        <div className="absolute bottom-[18%] right-[20%] h-16 w-16 rounded-full bg-cyan/40 blur-2xl" />
      </motion.div>

      {/* Floating browser frame */}
      <motion.div
        className="glass-strong absolute left-[8%] top-[12%] hidden w-56 rounded-xl p-2 md:block"
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-1.5 px-2 pb-2">
          <span className="h-2 w-2 rounded-full bg-rose-400/80" />
          <span className="h-2 w-2 rounded-full bg-amber-400/80" />
          <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
          <div className="ml-2 h-3 flex-1 rounded-sm bg-white/10" />
        </div>
        <div className="space-y-2 rounded-md bg-black/30 p-3">
          <div className="h-2 w-2/3 rounded bg-gradient-to-r from-violet to-cyan" />
          <div className="h-2 w-1/2 rounded bg-white/15" />
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <div className="aspect-square rounded bg-white/10" />
            <div className="aspect-square rounded bg-violet/40" />
            <div className="aspect-square rounded bg-cyan/30" />
          </div>
        </div>
      </motion.div>

      {/* Floating mobile frame */}
      <motion.div
        className="glass-strong absolute bottom-[8%] right-[6%] hidden w-32 rounded-2xl p-1.5 md:block"
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="space-y-1.5 rounded-xl bg-black/40 p-2.5">
          <div className="h-1.5 w-6 mx-auto rounded-full bg-white/30 mb-2" />
          <div className="h-16 rounded-md bg-gradient-to-br from-violet/60 via-indigo/50 to-cyan/40" />
          <div className="h-1.5 w-3/4 rounded bg-white/20" />
          <div className="h-1.5 w-1/2 rounded bg-white/10" />
        </div>
      </motion.div>

      {/* Orbit ring */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 lg:h-[600px] lg:w-[600px]"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan shadow-[0_0_30px_8px_oklch(0.78_0.18_215/60%)]" />
        <div className="absolute top-1/2 -right-1.5 h-2 w-2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_20px_4px_oklch(0.86_0.13_88/70%)]" />
      </motion.div>

      {/* Light rays */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 left-1/3 h-[200%] w-32 rotate-[18deg] bg-gradient-to-b from-white/10 via-white/5 to-transparent blur-2xl" />
        <div className="absolute -top-10 right-1/4 h-[200%] w-20 -rotate-[12deg] bg-gradient-to-b from-cyan/20 via-cyan/5 to-transparent blur-2xl" />
      </div>
    </div>
  );
}
