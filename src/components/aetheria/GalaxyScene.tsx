import { useEffect, useRef } from "react";

/**
 * Cinematic canvas 2D galaxy: dense spiral arms, pulsating core with
 * volumetric light rays, dust lanes, six orbiting planets with rings,
 * shooting comets and rare supernova flashes. Pure canvas 2D, no deps,
 * offscreen-paused, mobile-friendly.
 */

type Star = { r: number; a: number; z: number; size: number; hue: number; tw: number; bright: number };
type Planet = {
  orbit: number;
  angle: number;
  speed: number;
  size: number;
  hue: number;
  ring?: { inner: number; outer: number; tilt: number };
  tiltZ: number;
};
type Comet = { x: number; y: number; vx: number; vy: number; life: number; max: number; hue: number };

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
    const STAR_COUNT = mobile ? 2200 : 5200;
    const ARMS = 4;
    const stars: Star[] = new Array(STAR_COUNT).fill(0).map(() => {
      const t = Math.pow(Math.random(), 1.8);
      const r = 0.03 + t * 0.98;
      const arm = Math.floor(Math.random() * ARMS);
      const armOffset = (arm / ARMS) * Math.PI * 2;
      const twist = r * 4.6; // tighter spiral
      const spread = (1 - r) * 0.32 + 0.035;
      const a = armOffset + twist + (Math.random() - 0.5) * spread;
      const z = Math.random();
      const size = (Math.random() * 1.3 + 0.35) * (1 - r * 0.5);
      const hue = 42 + r * 220 + (Math.random() - 0.5) * 20;
      const tw = Math.random() * Math.PI * 2;
      // ~4% of stars are bright "giants" with cross flare
      const bright = Math.random() < 0.04 ? 1 : 0;
      return { r, a, z, size, hue, tw, bright };
    });

    // ----- planets (6) -----
    const planets: Planet[] = [
      { orbit: 0.34, angle: 0.4, speed: 0.00052, size: 10, hue: 42, tiltZ: 0.18 },
      { orbit: 0.48, angle: 2.1, speed: -0.00036, size: 22, hue: 280, tiltZ: -0.12, ring: { inner: 1.55, outer: 2.25, tilt: 0.28 } },
      { orbit: 0.63, angle: 4.3, speed: 0.00024, size: 12, hue: 195, tiltZ: 0.24 },
      { orbit: 0.76, angle: 5.7, speed: -0.00019, size: 18, hue: 320, tiltZ: -0.2, ring: { inner: 1.4, outer: 1.9, tilt: -0.36 } },
      { orbit: 0.88, angle: 1.3, speed: 0.00014, size: 26, hue: 26, tiltZ: 0.1, ring: { inner: 1.35, outer: 2.4, tilt: 0.52 } },
      { orbit: 0.97, angle: 3.6, speed: -0.0001, size: 8, hue: 155, tiltZ: -0.28 },
    ];

    // ----- comets / shooting stars -----
    const comets: Comet[] = [];
    const spawnComet = () => {
      if (comets.length > (mobile ? 2 : 4)) return;
      const side = Math.floor(Math.random() * 4);
      let x = 0, y = 0, vx = 0, vy = 0;
      const speed = 0.28 + Math.random() * 0.22;
      if (side === 0) { x = -20; y = Math.random() * H; vx = speed; vy = (Math.random() - 0.3) * 0.15; }
      else if (side === 1) { x = W + 20; y = Math.random() * H; vx = -speed; vy = (Math.random() - 0.3) * 0.15; }
      else if (side === 2) { x = Math.random() * W; y = -20; vx = (Math.random() - 0.5) * 0.2; vy = speed; }
      else { x = Math.random() * W; y = H + 20; vx = (Math.random() - 0.5) * 0.2; vy = -speed; }
      comets.push({ x, y, vx, vy, life: 0, max: 1800 + Math.random() * 1200, hue: [42, 195, 285, 320][Math.floor(Math.random() * 4)] });
    };

    // ----- supernova flash state -----
    let novaAt = performance.now() + 6000 + Math.random() * 8000;
    let novaX = 0, novaY = 0, novaLife = 0, novaHue = 195;

    // ----- offscreen nebula (drawn once, richer) -----
    let nebula: HTMLCanvasElement | null = null;
    const buildNebula = () => {
      const n = document.createElement("canvas");
      n.width = W;
      n.height = H;
      const nc = n.getContext("2d");
      if (!nc) return null;
      const blobs = mobile ? 8 : 14;
      const hues = [278, 302, 215, 195, 42, 330, 260];
      for (let i = 0; i < blobs; i++) {
        const bx = cx + (Math.random() - 0.5) * W * 1.0;
        const by = cy + (Math.random() - 0.5) * H * 0.85;
        const rad = Math.min(W, H) * (0.16 + Math.random() * 0.4);
        const hue = hues[Math.floor(Math.random() * hues.length)];
        const g = nc.createRadialGradient(bx, by, 0, bx, by, rad);
        g.addColorStop(0, `hsla(${hue}, 95%, 62%, 0.36)`);
        g.addColorStop(0.45, `hsla(${hue}, 90%, 50%, 0.11)`);
        g.addColorStop(1, "hsla(0, 0%, 0%, 0)");
        nc.globalCompositeOperation = "lighter";
        nc.fillStyle = g;
        nc.fillRect(0, 0, W, H);
      }
      // dark dust lanes along arms
      nc.globalCompositeOperation = "source-over";
      for (let i = 0; i < (mobile ? 60 : 140); i++) {
        const r = Math.random();
        const arm = Math.floor(Math.random() * ARMS);
        const armOffset = (arm / ARMS) * Math.PI * 2;
        const a = armOffset + r * 4.6 + (Math.random() - 0.5) * 0.06;
        const pr = Math.min(W, H) * 0.46 * r;
        const x = cx + Math.cos(a) * pr;
        const y = cy + Math.sin(a) * pr * 0.62;
        const rad = 8 + Math.random() * 24;
        const g = nc.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, "rgba(2,0,10,0.55)");
        g.addColorStop(1, "rgba(2,0,10,0)");
        nc.fillStyle = g;
        nc.beginPath();
        nc.arc(x, y, rad, 0, Math.PI * 2);
        nc.fill();
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
    const onClick = () => {
      // user-triggered nova at click
      novaAt = performance.now();
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("click", onClick);

    // pause when offscreen
    const io = new IntersectionObserver(
      ([e]) => { running = e.isIntersecting; if (running) tick(); },
      { rootMargin: "100px" },
    );
    io.observe(wrap);

    // ----- render -----
    let baseRot = 0;
    let last = performance.now();
    let nextComet = performance.now() + 2000;

    const draw = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;
      if (!reduced) baseRot += dt * 0.00007;

      mouseRef.current.x += (mouseRef.current.tx - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.ty - mouseRef.current.y) * 0.06;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // deep space background
      ctx.globalCompositeOperation = "source-over";
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.75);
      bg.addColorStop(0, "#0d0820");
      bg.addColorStop(0.5, "#06040f");
      bg.addColorStop(1, "#010005");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // nebula
      if (nebula) {
        ctx.globalAlpha = 0.95;
        ctx.drawImage(nebula, mx * -16, my * -12);
        ctx.globalAlpha = 1;
      }

      // additive
      ctx.globalCompositeOperation = "lighter";

      const radius = Math.min(W, H) * 0.5;

      // ----- volumetric light rays from core -----
      if (!reduced) {
        const rays = mobile ? 5 : 8;
        const rayLen = radius * 1.6;
        const pulse = 0.55 + Math.sin(now * 0.0011) * 0.25;
        ctx.save();
        ctx.translate(cx + mx * 6, cy + my * 6);
        ctx.rotate(baseRot * 3.5);
        for (let i = 0; i < rays; i++) {
          const ang = (i / rays) * Math.PI * 2;
          const g = ctx.createLinearGradient(0, 0, Math.cos(ang) * rayLen, Math.sin(ang) * rayLen);
          g.addColorStop(0, `hsla(48, 100%, 78%, ${0.28 * pulse})`);
          g.addColorStop(0.4, `hsla(300, 90%, 65%, ${0.08 * pulse})`);
          g.addColorStop(1, "hsla(270, 90%, 30%, 0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          const wAng = 0.09;
          ctx.lineTo(Math.cos(ang - wAng) * rayLen, Math.sin(ang - wAng) * rayLen);
          ctx.lineTo(Math.cos(ang + wAng) * rayLen, Math.sin(ang + wAng) * rayLen);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // pulsating core glow (behind stars)
      const pulse = 0.85 + Math.sin(now * 0.0016) * 0.15;
      const coreR = radius * 0.34 * pulse;
      const coreGrad = ctx.createRadialGradient(cx + mx * 6, cy + my * 6, 0, cx + mx * 6, cy + my * 6, coreR);
      coreGrad.addColorStop(0, "hsla(48, 100%, 85%, 0.98)");
      coreGrad.addColorStop(0.15, "hsla(38, 100%, 68%, 0.6)");
      coreGrad.addColorStop(0.5, "hsla(300, 95%, 58%, 0.28)");
      coreGrad.addColorStop(1, "hsla(270, 90%, 30%, 0)");
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, W, H);

      // stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const a = s.a + baseRot * (1 - s.r * 0.32);
        const pr = radius * s.r;
        const parX = mx * (10 + s.z * 26);
        const parY = my * (8 + s.z * 22);
        const x = cx + Math.cos(a) * pr + parX;
        const y = cy + Math.sin(a) * pr * 0.62 + parY;
        const tw = 0.55 + Math.sin(now * 0.003 + s.tw) * 0.45;
        const alpha = (0.55 + 0.45 * (1 - s.r)) * tw;
        const size = s.size * (1 + (1 - s.r) * 0.6);
        ctx.fillStyle = `hsla(${s.hue}, 92%, 80%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // bright giants — cross flare
        if (s.bright) {
          const fl = size * (2.6 + tw * 1.4);
          ctx.strokeStyle = `hsla(${s.hue}, 95%, 90%, ${alpha * 0.7})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(x - fl, y); ctx.lineTo(x + fl, y);
          ctx.moveTo(x, y - fl); ctx.lineTo(x, y + fl);
          ctx.stroke();
        }
      }

      // bright core kernel
      const kernel = ctx.createRadialGradient(cx + mx * 6, cy + my * 6, 0, cx + mx * 6, cy + my * 6, coreR * 0.28);
      kernel.addColorStop(0, "hsla(50, 100%, 98%, 1)");
      kernel.addColorStop(0.4, "hsla(38, 100%, 72%, 0.65)");
      kernel.addColorStop(1, "hsla(38, 100%, 60%, 0)");
      ctx.fillStyle = kernel;
      ctx.fillRect(0, 0, W, H);

      // ----- comets -----
      if (!reduced && now > nextComet) {
        spawnComet();
        nextComet = now + 2200 + Math.random() * 3200;
      }
      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.life += dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        if (c.life > c.max || c.x < -60 || c.x > W + 60 || c.y < -60 || c.y > H + 60) {
          comets.splice(i, 1);
          continue;
        }
        const t = c.life / c.max;
        const alpha = Math.sin(t * Math.PI);
        const tailLen = 120;
        const tx = c.x - c.vx * tailLen;
        const ty = c.y - c.vy * tailLen;
        const g = ctx.createLinearGradient(c.x, c.y, tx, ty);
        g.addColorStop(0, `hsla(${c.hue}, 95%, 92%, ${0.95 * alpha})`);
        g.addColorStop(0.4, `hsla(${c.hue}, 90%, 75%, ${0.35 * alpha})`);
        g.addColorStop(1, `hsla(${c.hue}, 90%, 60%, 0)`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        // head
        ctx.fillStyle = `hsla(${c.hue}, 100%, 96%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // ----- supernova flash -----
      if (!reduced && now >= novaAt && novaLife === 0) {
        novaLife = 1;
        const s = stars[Math.floor(Math.random() * stars.length)];
        const a = s.a + baseRot * (1 - s.r * 0.32);
        const pr = radius * s.r;
        novaX = cx + Math.cos(a) * pr;
        novaY = cy + Math.sin(a) * pr * 0.62;
        novaHue = [42, 195, 285, 320][Math.floor(Math.random() * 4)];
      }
      if (novaLife > 0) {
        const t = novaLife / 1400;
        const a = Math.max(0, 1 - t);
        const rN = 6 + t * (mobile ? 90 : 180);
        const g = ctx.createRadialGradient(novaX, novaY, 0, novaX, novaY, rN);
        g.addColorStop(0, `hsla(0,0%,100%,${a})`);
        g.addColorStop(0.25, `hsla(${novaHue}, 100%, 78%, ${a * 0.85})`);
        g.addColorStop(0.7, `hsla(${novaHue}, 95%, 55%, ${a * 0.25})`);
        g.addColorStop(1, `hsla(${novaHue}, 95%, 40%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(novaX, novaY, rN, 0, Math.PI * 2);
        ctx.fill();
        // flare cross
        ctx.strokeStyle = `hsla(0,0%,100%,${a * 0.9})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(novaX - rN, novaY); ctx.lineTo(novaX + rN, novaY);
        ctx.moveTo(novaX, novaY - rN); ctx.lineTo(novaX, novaY + rN);
        ctx.stroke();
        novaLife += dt;
        if (novaLife > 1400) {
          novaLife = 0;
          novaAt = now + 7000 + Math.random() * 10000;
        }
      }

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

        // orbit trail
        ctx.strokeStyle = "hsla(210, 40%, 80%, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx + mx * 22, cy + my * 16, orbitR, orbitR * 0.62, 0, 0, Math.PI * 2);
        ctx.stroke();

        drawPlanet(ctx, px, py, p);
      }

      // vignette
      ctx.globalCompositeOperation = "source-over";
      const vg = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, Math.max(W, H) * 0.72);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.8)");
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
      wrap.removeEventListener("click", onClick);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl ring-1 ring-white/10 cursor-crosshair"
      style={{ background: "#010005", boxShadow: "0 60px 160px -40px oklch(0.55 0.25 270 / 55%), 0 0 100px -20px oklch(0.7 0.24 300 / 30%)" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* corner meta chips */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4 text-[10px] uppercase tracking-[0.3em] text-white/45">
        <span>Aetheria · Observatory</span>
        <span className="hidden sm:inline">RA 17h · DEC −29° · спираль M-Æ</span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-[10px] uppercase tracking-[0.3em] text-white/45">
        <span>06 планет · спиральная галактика</span>
        <span className="hidden sm:inline">real-time · клик = сверхновая</span>
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
  grad.addColorStop(0, `hsla(${p.hue}, 90%, 90%, 1)`);
  grad.addColorStop(0.35, `hsla(${p.hue}, 78%, 60%, 1)`);
  grad.addColorStop(0.75, `hsla(${p.hue}, 72%, 26%, 1)`);
  grad.addColorStop(1, `hsla(${p.hue + 20}, 60%, 6%, 1)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, p.size, 0, Math.PI * 2);
  ctx.fill();

  // specular highlight
  ctx.globalCompositeOperation = "lighter";
  const spec = ctx.createRadialGradient(
    x - p.size * 0.4, y - p.size * 0.45, 0,
    x - p.size * 0.4, y - p.size * 0.45, p.size * 0.55,
  );
  spec.addColorStop(0, `hsla(${p.hue}, 100%, 96%, 0.7)`);
  spec.addColorStop(1, `hsla(${p.hue}, 100%, 90%, 0)`);
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.arc(x, y, p.size, 0, Math.PI * 2);
  ctx.fill();

  // atmospheric halo
  const halo = ctx.createRadialGradient(x, y, p.size * 0.9, x, y, p.size * 2.1);
  halo.addColorStop(0, `hsla(${p.hue}, 90%, 72%, 0.4)`);
  halo.addColorStop(1, `hsla(${p.hue}, 90%, 60%, 0)`);
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, p.size * 2.1, 0, Math.PI * 2);
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
    rg.addColorStop(0.5, `hsla(${p.hue}, 95%, 88%, 0.8)`);
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
