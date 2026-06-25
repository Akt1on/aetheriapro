import { useEffect, useRef } from "react";

/**
 * Premium "galaxy" canvas: layered parallax starfield, twinkling bright stars,
 * occasional shooting stars, subtle nebula glow. Optimised for 60 FPS:
 *  - DPR capped at 1.5
 *  - No O(n²) line connections
 *  - Nebula pre-rendered once to an offscreen canvas
 *  - Pauses when tab hidden / reduced motion
 */
export function ParticleField({ density = 220, className = "" }: { density?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

    let w = 0, h = 0;
    const resize = () => {
      const cw = canvas.offsetWidth || canvas.parentElement?.offsetWidth || window.innerWidth;
      const ch = canvas.offsetHeight || canvas.parentElement?.offsetHeight || window.innerHeight;
      w = canvas.width = Math.max(1, Math.floor(cw * DPR));
      h = canvas.height = Math.max(1, Math.floor(ch * DPR));
      buildNebula();
    };

    // ---- Nebula (drawn once to offscreen) ----
    const nebula = document.createElement("canvas");
    const nctx = nebula.getContext("2d")!;
    const buildNebula = () => {
      nebula.width = w;
      nebula.height = h;
      const blobs = [
        { x: w * 0.25, y: h * 0.3, r: Math.max(w, h) * 0.55, c: "rgba(120, 80, 255, 0.22)" },
        { x: w * 0.75, y: h * 0.55, r: Math.max(w, h) * 0.45, c: "rgba(80, 200, 255, 0.18)" },
        { x: w * 0.55, y: h * 0.85, r: Math.max(w, h) * 0.4, c: "rgba(255, 120, 200, 0.12)" },
      ];
      for (const b of blobs) {
        const g = nctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.c);
        g.addColorStop(1, "rgba(0,0,0,0)");
        nctx.fillStyle = g;
        nctx.fillRect(0, 0, w, h);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ---- Stars: 3 parallax layers ----
    type Star = { x: number; y: number; r: number; a: number; tw: number; tp: number; depth: number; hue: number };
    const N = Math.max(60, Math.min(density, 320));
    const stars: Star[] = Array.from({ length: N }, () => {
      const depth = Math.random();
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: (0.6 + depth * 2.2) * DPR,
        a: 0.7 + Math.random() * 0.3,
        tw: Math.random() * Math.PI * 2,
        tp: 0.4 + Math.random() * 1.8,
        depth,
        hue: 200 + Math.random() * 80,
      };
    });

    // A handful of luminous "hero" stars
    const heroes = Array.from({ length: 22 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (2 + Math.random() * 2) * DPR,
      tw: Math.random() * Math.PI * 2,
      tp: 0.6 + Math.random() * 1.2,
      hue: Math.random() < 0.5 ? 270 : 200,
    }));

    // ---- Shooting stars ----
    type Shot = { x: number; y: number; vx: number; vy: number; life: number; max: number };
    const shots: Shot[] = [];
    const spawnShot = () => {
      const fromLeft = Math.random() < 0.5;
      const sp = (6 + Math.random() * 4) * DPR;
      shots.push({
        x: fromLeft ? -40 : w + 40,
        y: Math.random() * h * 0.6,
        vx: fromLeft ? sp : -sp,
        vy: sp * (0.3 + Math.random() * 0.3),
        life: 0,
        max: 70 + Math.random() * 50,
      });
    };

    // ---- Mouse parallax ----
    const target = { x: 0, y: 0 };
    const par = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 30 * DPR;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 30 * DPR;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    let last = performance.now();
    let shotTimer = 60;
    let visible = true;
    const onVis = () => { visible = !document.hidden; if (visible) { last = performance.now(); loop(last); } };
    document.addEventListener("visibilitychange", onVis);

    const loop = (now: number) => {
      const dt = Math.min(48, now - last) / 16.67;
      last = now;

      par.x += (target.x - par.x) * 0.05;
      par.y += (target.y - par.y) * 0.05;

      // background nebula (cheap blit)
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(nebula, 0, 0);

      // stars
      ctx.globalCompositeOperation = "lighter";
      for (const s of stars) {
        s.tw += 0.03 * s.tp * dt;
        const tw = 0.55 + 0.45 * Math.sin(s.tw);
        const px = s.x + par.x * (0.2 + s.depth);
        const py = s.y + par.y * (0.2 + s.depth);
        // subtle drift
        s.x += 0.02 * s.depth * dt;
        if (s.x > w + 4) s.x = -4;

        ctx.fillStyle = `hsla(${s.hue}, 70%, ${85 + s.depth * 10}%, ${s.a * tw})`;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // hero stars with halo
      for (const s of heroes) {
        s.tw += 0.04 * s.tp * dt;
        const tw = 0.5 + 0.5 * Math.sin(s.tw);
        const px = s.x + par.x * 0.9;
        const py = s.y + par.y * 0.9;
        const halo = ctx.createRadialGradient(px, py, 0, px, py, s.r * 8);
        halo.addColorStop(0, `hsla(${s.hue}, 95%, 80%, ${0.55 * tw})`);
        halo.addColorStop(0.5, `hsla(${s.hue}, 95%, 65%, ${0.12 * tw})`);
        halo.addColorStop(1, "hsla(0,0%,0%,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(px, py, s.r * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `hsla(${s.hue}, 100%, 95%, ${0.9 * tw})`;
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // shooting stars
      if (!reduced) {
        shotTimer -= dt;
        if (shotTimer <= 0) { spawnShot(); shotTimer = 220 + Math.random() * 260; }
        for (let i = shots.length - 1; i >= 0; i--) {
          const sh = shots[i];
          sh.life += dt;
          sh.x += sh.vx * dt;
          sh.y += sh.vy * dt;
          const t = sh.life / sh.max;
          if (t >= 1 || sh.x < -80 || sh.x > w + 80) { shots.splice(i, 1); continue; }
          const fade = Math.sin(t * Math.PI);
          const tailLen = 120 * DPR;
          const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 10, sh.y - sh.vy * 10);
          grad.addColorStop(0, `rgba(255,255,255,${0.9 * fade})`);
          grad.addColorStop(0.3, `rgba(180,200,255,${0.6 * fade})`);
          grad.addColorStop(1, "rgba(180,200,255,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.8 * DPR;
          ctx.beginPath();
          ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(sh.x - (sh.vx / Math.hypot(sh.vx, sh.vy)) * tailLen, sh.y - (sh.vy / Math.hypot(sh.vx, sh.vy)) * tailLen);
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = "source-over";
      if (visible) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density]);

  return <canvas ref={ref} className={`h-full w-full ${className}`} aria-hidden="true" />;
}
