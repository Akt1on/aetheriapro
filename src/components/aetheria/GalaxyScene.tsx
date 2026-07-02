import { useEffect, useRef } from "react";

/**
 * Pure canvas 2D galaxy: spiral arms of thousands of stars, glowing core,
 * orbiting planets with shading and rings, subtle nebula & parallax.
 * No WebGL, no deps — smooth on mobile, pauses when offscreen.
 */

type Star = { r: number; a: number; z: number; size: number; hue: number; tw: number };
type Planet = {
  orbit: number;
  angle: number;
  speed: number;
  size: number;
  hue: number;
  ring?: { inner: number; outer: number; tilt: number };
  tiltZ: number;
};

export function GalaxyScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    let cx = 0;
    let cy = 0;
    let running = true;
    let rafId = 0;

    // ----- build galaxy -----
    const STAR_COUNT = mobile ? 1400 : 3200;
    const ARMS = 4;
    const stars: Star[] = new Array(STAR_COUNT).fill(0).map(() => {
      // exponential radial distribution — dense core, sparse edges
      const t = Math.pow(Math.random(), 1.7);
      const r = 0.04 + t * 0.95;
      const arm = Math.floor(Math.random() * ARMS);
      const armOffset = (arm / ARMS) * Math.PI * 2;
      const twist = r * 4.2; // spiral tightness
      const spread = (1 - r) * 0.35 + 0.04;
      const a = armOffset + twist + (Math.random() - 0.5) * spread;
      const z = Math.random(); // depth 0..1 for parallax
      const size = (Math.random() * 1.1 + 0.3) * (1 - r * 0.55);
      // hue: core warm gold, mid violet, edge cyan
      const hue = 42 + r * 220 + (Math.random() - 0.5) * 18;
      const tw = Math.random() * Math.PI * 2;
      return { r, a, z, size, hue, tw };
    });

    // ----- planets -----
    const planets: Planet[] = [
      { orbit: 0.42, angle: 0.4, speed: 0.00042, size: 14, hue: 30, tiltZ: 0.18 },
      { orbit: 0.6, angle: 2.1, speed: -0.00028, size: 22, hue: 280, tiltZ: -0.12, ring: { inner: 1.55, outer: 2.2, tilt: 0.28 } },
      { orbit: 0.78, angle: 4.3, speed: 0.00019, size: 10, hue: 195, tiltZ: 0.24 },
      { orbit: 0.92, angle: 5.7, speed: -0.00013, size: 17, hue: 320, tiltZ: -0.2, ring: { inner: 1.4, outer: 1.85, tilt: -0.36 } },
    ];

    // ----- offscreen nebula (drawn once) -----
    let nebula: HTMLCanvasElement | null = null;
    const buildNebula = () => {
      const n = document.createElement("canvas");
      n.width = W;
      n.height = H;
      const nc = n.getContext("2d");
      if (!nc) return null;
      const blobs = mobile ? 5 : 8;
      for (let i = 0; i < blobs; i++) {
        const bx = cx + (Math.random() - 0.5) * W * 0.9;
        const by = cy + (Math.random() - 0.5) * H * 0.7;
        const rad = Math.min(W, H) * (0.18 + Math.random() * 0.32);
        const hues = [278, 302, 215, 195, 42];
        const hue = hues[i % hues.length];
        const g = nc.createRadialGradient(bx, by, 0, bx, by, rad);
        g.addColorStop(0, `hsla(${hue}, 90%, 60%, 0.28)`);
        g.addColorStop(0.5, `hsla(${hue}, 90%, 50%, 0.08)`);
        g.addColorStop(1, "hsla(0, 0%, 0%, 0)");
        nc.fillStyle = g;
        nc.fillRect(0, 0, W, H);
      }
      return n;
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      W = Math.max(1, Math.floor(rect.width));
      H = Math.max(1, Math.floor(rect.height));
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2;
      cy = H / 2;
      nebula = buildNebula();
    };
    resize();

    const onResize = () => { dpr = Math.min(window.devicePixelRatio || 1, 2); resize(); };
    window.addEventListener("resize", onResize, { passive: true });

    // ----- interaction -----
    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      mouseRef.current.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onLeave = () => { mouseRef.current.tx = 0; mouseRef.current.ty = 0; };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    // pause when offscreen
    const io = new IntersectionObserver(
      ([e]) => { running = e.isIntersecting; if (running) tick(); },
      { rootMargin: "100px" },
    );
    io.observe(wrap);

    // ----- render -----
    let baseRot = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;
      if (!reduced) baseRot += dt * 0.00006;

      // ease mouse
      mouseRef.current.x += (mouseRef.current.tx - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.ty - mouseRef.current.y) * 0.06;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // clear with deep space
      ctx.globalCompositeOperation = "source-over";
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      bg.addColorStop(0, "#0b0716");
      bg.addColorStop(0.5, "#06040f");
      bg.addColorStop(1, "#020106");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // nebula
      if (nebula) {
        ctx.globalAlpha = 0.9;
        ctx.drawImage(nebula, mx * -14, my * -10);
        ctx.globalAlpha = 1;
      }

      // additive draw
      ctx.globalCompositeOperation = "lighter";

      // scale factor for galaxy radius
      const radius = Math.min(W, H) * 0.46;

      // core glow (behind stars)
      const coreR = radius * 0.32;
      const coreGrad = ctx.createRadialGradient(cx + mx * 6, cy + my * 6, 0, cx + mx * 6, cy + my * 6, coreR);
      coreGrad.addColorStop(0, "hsla(48, 100%, 82%, 0.95)");
      coreGrad.addColorStop(0.15, "hsla(38, 100%, 68%, 0.55)");
      coreGrad.addColorStop(0.5, "hsla(300, 90%, 55%, 0.25)");
      coreGrad.addColorStop(1, "hsla(270, 90%, 30%, 0)");
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, W, H);

      // stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const a = s.a + baseRot * (1 - s.r * 0.35);
        const pr = radius * s.r;
        const parX = mx * (10 + s.z * 24);
        const parY = my * (8 + s.z * 20);
        const x = cx + Math.cos(a) * pr + parX;
        const y = cy + Math.sin(a) * pr * 0.62 + parY; // ellipse tilt
        const tw = 0.6 + Math.sin(now * 0.003 + s.tw) * 0.4;
        const alpha = (0.55 + 0.45 * (1 - s.r)) * tw;
        const size = s.size * (1 + (1 - s.r) * 0.6);
        ctx.fillStyle = `hsla(${s.hue}, 90%, 78%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // bright core kernel
      ctx.globalCompositeOperation = "lighter";
      const kernel = ctx.createRadialGradient(cx + mx * 6, cy + my * 6, 0, cx + mx * 6, cy + my * 6, coreR * 0.25);
      kernel.addColorStop(0, "hsla(50, 100%, 96%, 1)");
      kernel.addColorStop(0.4, "hsla(38, 100%, 70%, 0.6)");
      kernel.addColorStop(1, "hsla(38, 100%, 60%, 0)");
      ctx.fillStyle = kernel;
      ctx.fillRect(0, 0, W, H);

      // planets
      ctx.globalCompositeOperation = "source-over";
      const planetOrder = [...planets].sort((a, b) => {
        const ay = Math.sin(a.angle) * a.orbit;
        const by = Math.sin(b.angle) * b.orbit;
        return ay - by;
      });
      for (const p of planetOrder) {
        if (!reduced) p.angle += p.speed * dt;
        const orbitR = radius * p.orbit;
        const px = cx + Math.cos(p.angle) * orbitR + mx * 22;
        const py = cy + Math.sin(p.angle) * orbitR * 0.62 + my * 16;

        // faint orbit trail
        ctx.strokeStyle = "hsla(210, 40%, 80%, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx + mx * 22, cy + my * 16, orbitR, orbitR * 0.62, 0, 0, Math.PI * 2);
        ctx.stroke();

        drawPlanet(ctx, px, py, p);
      }

      // subtle vignette
      ctx.globalCompositeOperation = "source-over";
      const vg = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, Math.max(W, H) * 0.7);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.75)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    };

    const tick = () => {
      if (!running) return;
      rafId = requestAnimationFrame((t) => { draw(t); tick(); });
    };
    tick();

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl ring-1 ring-white/10"
      style={{ background: "#020106" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* corner meta chips */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4 text-[10px] uppercase tracking-[0.3em] text-white/40">
        <span>Aetheria · Observatory</span>
        <span className="hidden sm:inline">RA 17h · DEC −29° · спираль M-Æ</span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-[10px] uppercase tracking-[0.3em] text-white/40">
        <span>04 планеты · спиральная галактика</span>
        <span className="hidden sm:inline">real-time · 60 fps</span>
      </div>
      {/* faint grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-screen"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
    </div>
  );
}

function drawPlanet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  p: { size: number; hue: number; ring?: { inner: number; outer: number; tilt: number }; tiltZ: number },
) {
  // back ring
  if (p.ring) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(p.ring.tilt);
    ctx.scale(1, 0.32);
    const rg = ctx.createRadialGradient(0, 0, p.size * p.ring.inner, 0, 0, p.size * p.ring.outer);
    rg.addColorStop(0, `hsla(${p.hue}, 60%, 70%, 0)`);
    rg.addColorStop(0.5, `hsla(${p.hue}, 80%, 78%, 0.55)`);
    rg.addColorStop(1, `hsla(${p.hue}, 80%, 60%, 0)`);
    ctx.strokeStyle = rg as unknown as string; // fallback
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(0, 0, p.size * p.ring.outer, Math.PI, Math.PI * 2);
    ctx.arc(0, 0, p.size * p.ring.inner, Math.PI * 2, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // planet body — lit sphere
  const grad = ctx.createRadialGradient(
    x - p.size * 0.35,
    y - p.size * 0.4,
    p.size * 0.05,
    x,
    y,
    p.size * 1.05,
  );
  grad.addColorStop(0, `hsla(${p.hue}, 90%, 88%, 1)`);
  grad.addColorStop(0.35, `hsla(${p.hue}, 75%, 60%, 1)`);
  grad.addColorStop(0.75, `hsla(${p.hue}, 70%, 28%, 1)`);
  grad.addColorStop(1, `hsla(${p.hue + 20}, 60%, 8%, 1)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, p.size, 0, Math.PI * 2);
  ctx.fill();

  // atmospheric halo
  ctx.globalCompositeOperation = "lighter";
  const halo = ctx.createRadialGradient(x, y, p.size * 0.9, x, y, p.size * 1.9);
  halo.addColorStop(0, `hsla(${p.hue}, 90%, 70%, 0.35)`);
  halo.addColorStop(1, `hsla(${p.hue}, 90%, 60%, 0)`);
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, p.size * 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  // front ring
  if (p.ring) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(p.ring.tilt);
    ctx.scale(1, 0.32);
    const rg = ctx.createRadialGradient(0, 0, p.size * p.ring.inner, 0, 0, p.size * p.ring.outer);
    rg.addColorStop(0, `hsla(${p.hue}, 60%, 70%, 0)`);
    rg.addColorStop(0.5, `hsla(${p.hue}, 90%, 85%, 0.75)`);
    rg.addColorStop(1, `hsla(${p.hue}, 80%, 55%, 0)`);
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(0, 0, p.size * p.ring.outer, 0, Math.PI);
    ctx.arc(0, 0, p.size * p.ring.inner, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
