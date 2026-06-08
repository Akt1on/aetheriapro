import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, animate } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ArrowRight, Sparkles, Layers, Zap, Clock } from "lucide-react";

type Selections = {
  type: string;
  style: string;
  capabilities: string[];
  scope: string;
};

const STEPS = [
  { key: "type", label: "Project Type", icon: Layers },
  { key: "style", label: "Design Direction", icon: Sparkles },
  { key: "caps", label: "Capabilities", icon: Zap },
  { key: "scope", label: "Scope & Timeline", icon: Clock },
] as const;

const TYPES = [
  { id: "landing", label: "Signature Landing", desc: "A single, cinematic page.", base: 18000 },
  { id: "corp", label: "Corporate Site", desc: "Multi-page brand experience.", base: 38000 },
  { id: "ecom", label: "E-commerce 3D", desc: "Immersive product storytelling.", base: 62000 },
  { id: "app", label: "Web Application", desc: "Custom product, PWA-ready.", base: 85000 },
];

const STYLES = [
  { id: "void", label: "Void Luxe", colors: ["#0a0a1a", "#4f46e5", "#a855f7", "#22d3ee"] },
  { id: "editorial", label: "Editorial", colors: ["#f5f3ee", "#0d0d0d", "#c9a84c", "#6b3a2a"] },
  { id: "neo", label: "Neo Brutalist", colors: ["#ffffff", "#0a0a0a", "#ff5722", "#ffeb3b"] },
  { id: "glass", label: "Glass Aurora", colors: ["#1a1a2e", "#4ade80", "#a78bfa", "#67e8f9"] },
];

const CAPS = [
  { id: "3d", label: "Real-time 3D / WebGL", add: 14000 },
  { id: "ai", label: "AI Interfaces", add: 11000 },
  { id: "cms", label: "Headless CMS", add: 6000 },
  { id: "anim", label: "Cinematic Motion", add: 8000 },
  { id: "i18n", label: "Multi-language", add: 4500 },
  { id: "perf", label: "Edge Performance", add: 5000 },
];

const SCOPES = [
  { id: "sprint", label: "Sprint · 4 weeks", mult: 1.15 },
  { id: "standard", label: "Standard · 8 weeks", mult: 1.0 },
  { id: "premium", label: "Premium · 12 weeks", mult: 1.25 },
];

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 30, stiffness: 90 });
  const rounded = useTransform(spring, (v) => `$${Math.round(v).toLocaleString()}`);
  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
    return ctrl.stop;
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}

export function Configurator() {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Selections>({ type: "corp", style: "void", capabilities: ["anim", "perf"], scope: "standard" });
  const [submitted, setSubmitted] = useState(false);

  const price = useMemo(() => {
    const base = TYPES.find((t) => t.id === sel.type)?.base ?? 0;
    const caps = sel.capabilities.reduce((sum, c) => sum + (CAPS.find((x) => x.id === c)?.add ?? 0), 0);
    const mult = SCOPES.find((s) => s.id === sel.scope)?.mult ?? 1;
    return Math.round((base + caps) * mult);
  }, [sel]);

  const toggleCap = (id: string) =>
    setSel((s) => ({ ...s, capabilities: s.capabilities.includes(id) ? s.capabilities.filter((c) => c !== id) : [...s.capabilities, id] }));

  const styleObj = STYLES.find((s) => s.id === sel.style) ?? STYLES[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
      {/* Left: form */}
      <div className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-10">
        <div className="aurora-bg opacity-40" />
        <div className="relative">
          {/* Stepper */}
          <div className="mb-8 flex items-center gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <button
                  key={s.key}
                  onClick={() => setStep(i)}
                  className="group flex items-center gap-2"
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-500 ${
                      active
                        ? "border-violet bg-violet/20 text-white shadow-[0_0_30px_-5px_oklch(0.7_0.24_300/70%)]"
                        : done
                        ? "border-cyan/60 bg-cyan/10 text-cyan"
                        : "border-white/15 bg-white/5 text-white/50"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  {i < STEPS.length - 1 && <span className={`h-px w-6 md:w-10 ${i < step ? "bg-cyan/50" : "bg-white/10"}`} />}
                </button>
              );
            })}
          </div>

          <div className="mb-6">
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">Step 0{step + 1} / 04</div>
            <h3 className="mt-1 font-display text-3xl text-white md:text-4xl">{STEPS[step].label}</h3>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {TYPES.map((t) => (
                    <OptionCard key={t.id} active={sel.type === t.id} onClick={() => setSel({ ...sel, type: t.id })}>
                      <div className="text-base font-semibold text-white">{t.label}</div>
                      <div className="mt-1 text-sm text-white/55">{t.desc}</div>
                      <div className="mt-3 text-xs text-cyan/80">from ${t.base.toLocaleString()}</div>
                    </OptionCard>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {STYLES.map((s) => (
                    <OptionCard key={s.id} active={sel.style === s.id} onClick={() => setSel({ ...sel, style: s.id })}>
                      <div className="flex items-center justify-between">
                        <div className="text-base font-semibold text-white">{s.label}</div>
                      </div>
                      <div className="mt-3 flex gap-1.5">
                        {s.colors.map((c) => (
                          <div key={c} className="h-7 w-7 rounded-md ring-1 ring-white/10" style={{ background: c }} />
                        ))}
                      </div>
                    </OptionCard>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {CAPS.map((c) => (
                    <OptionCard key={c.id} active={sel.capabilities.includes(c.id)} onClick={() => toggleCap(c.id)}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-white">{c.label}</div>
                        <div className="text-xs text-cyan/80">+${c.add.toLocaleString()}</div>
                      </div>
                    </OptionCard>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  {SCOPES.map((s) => (
                    <OptionCard key={s.id} active={sel.scope === s.id} onClick={() => setSel({ ...sel, scope: s.id })}>
                      <div className="flex items-center justify-between">
                        <div className="text-base font-semibold text-white">{s.label}</div>
                        <div className="text-xs text-white/50">×{s.mult.toFixed(2)}</div>
                      </div>
                    </OptionCard>
                  ))}

                  <div className="glass mt-6 rounded-2xl p-5">
                    <div className="text-xs uppercase tracking-widest text-white/40">Brief contact</div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input className="rounded-lg bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none ring-1 ring-white/10 transition focus:ring-violet" placeholder="Name" />
                      <input className="rounded-lg bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none ring-1 ring-white/10 transition focus:ring-violet" placeholder="Email" />
                      <input className="rounded-lg bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none ring-1 ring-white/10 transition focus:ring-violet sm:col-span-2" placeholder="Company" />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="text-sm text-white/60 transition hover:text-white disabled:opacity-30"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="btn-primary-glow group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm"
              >
                Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <button
                onClick={() => setSubmitted(true)}
                className="btn-primary-glow group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm"
              >
                Submit Brief <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right: live preview */}
      <div className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="aurora-bg opacity-50" style={{ filter: "blur(60px)" }} />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/40">Live Preview</div>
              <div className="mt-1 font-display text-2xl text-white">Your Experience</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-white/40">Investment</div>
              <div className="font-display text-3xl text-aurora">
                <AnimatedNumber value={price} />
              </div>
            </div>
          </div>

          {/* Live mock */}
          <div className="relative mt-6 flex-1">
            <PreviewMock styleId={sel.style} caps={sel.capabilities} type={sel.type} />
          </div>

          {/* Active palette */}
          <div className="mt-6">
            <div className="text-xs uppercase tracking-widest text-white/40">Palette</div>
            <div className="mt-2 flex gap-2">
              {styleObj.colors.map((c) => (
                <motion.div
                  key={c}
                  layout
                  className="h-8 flex-1 rounded-lg ring-1 ring-white/10"
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {submitted && <SuccessOverlay onClose={() => setSubmitted(false)} price={price} />}
      </AnimatePresence>
    </div>
  );
}

function OptionCard({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-500 ${
        active
          ? "border-violet/60 bg-violet/10 shadow-[0_0_40px_-10px_oklch(0.7_0.24_300/60%)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
      }`}
    >
      {active && (
        <motion.div
          layoutId="opt-glow"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(60% 50% at 50% 0%, oklch(0.7 0.24 300 / 25%), transparent 70%)" }}
        />
      )}
      <div className="relative">{children}</div>
    </button>
  );
}

function PreviewMock({ styleId, caps, type }: { styleId: string; caps: string[]; type: string }) {
  const palette: Record<string, { bg: string; ink: string; accent: string; glow: string }> = {
    void: { bg: "linear-gradient(160deg, #0a0a1a, #1a1235)", ink: "#fff", accent: "#a855f7", glow: "oklch(0.7 0.24 300 / 60%)" },
    editorial: { bg: "linear-gradient(160deg, #f5f3ee, #e8e4dd)", ink: "#0d0d0d", accent: "#c9a84c", glow: "oklch(0.86 0.13 88 / 50%)" },
    neo: { bg: "#ffffff", ink: "#0a0a0a", accent: "#ff5722", glow: "oklch(0.7 0.22 35 / 60%)" },
    glass: { bg: "linear-gradient(160deg, #1a1a2e, #16213e)", ink: "#fff", accent: "#67e8f9", glow: "oklch(0.82 0.16 215 / 60%)" },
  };
  const p = palette[styleId] ?? palette.void;
  const is3D = caps.includes("3d");
  const isAI = caps.includes("ai");

  return (
    <motion.div
      key={styleId + type}
      initial={{ opacity: 0, scale: 0.96, rotateX: 10 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-full min-h-[280px] overflow-hidden rounded-2xl ring-1 ring-white/10"
      style={{ background: p.bg, boxShadow: `0 30px 80px -20px ${p.glow}` }}
    >
      {/* device chrome */}
      <div className="flex items-center gap-1.5 border-b border-black/10 bg-black/5 px-3 py-2 dark:border-white/10 dark:bg-white/5">
        <span className="h-2 w-2 rounded-full" style={{ background: "#ff5f57" }} />
        <span className="h-2 w-2 rounded-full" style={{ background: "#ffbd2e" }} />
        <span className="h-2 w-2 rounded-full" style={{ background: "#28c840" }} />
        <div className="ml-3 h-2.5 flex-1 rounded-full opacity-30" style={{ background: p.ink }} />
      </div>

      <div className="relative p-5">
        <motion.div
          className="absolute right-6 top-6 h-24 w-24 rounded-full"
          style={{ background: p.accent, filter: "blur(30px)", opacity: 0.6 }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="relative">
          <div className="text-[10px] uppercase tracking-[0.3em] opacity-50" style={{ color: p.ink }}>aetheria · live</div>
          <div className="mt-2 font-display text-2xl leading-tight md:text-3xl" style={{ color: p.ink }}>
            {type === "ecom" ? "Objects of desire." : type === "app" ? "Build something real." : type === "landing" ? "One page. Infinite depth." : "Brands that move."}
          </div>
          <div className="mt-3 h-1.5 w-16 rounded-full" style={{ background: p.accent }} />

          <div className="mt-6 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="aspect-square rounded-lg ring-1"
                style={{
                  background: i === 1 ? p.accent : `${p.ink}10`,
                  // @ts-expect-error custom ring color
                  "--tw-ring-color": `${p.ink}20`,
                }}
                animate={is3D ? { rotateY: [0, 12, -8, 0], y: [0, -4, 0] } : { y: [0, -2, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
              />
            ))}
          </div>

          {isAI && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-medium"
              style={{ background: `${p.accent}22`, color: p.ink, border: `1px solid ${p.accent}55` }}
            >
              <Sparkles className="h-3 w-3" style={{ color: p.accent }} /> AI assistant connected
            </motion.div>
          )}
        </div>
      </div>

      {/* sweeping light ray */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -inset-y-10 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          animate={{ x: ["0%", "400%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transform: "skewX(-18deg)" }}
        />
      </div>
    </motion.div>
  );
}

function SuccessOverlay({ onClose, price }: { onClose: () => void; price: number }) {
  const pieces = useRef(Array.from({ length: 48 }, (_, i) => i));
  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      {/* confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.current.map((i) => {
          const colors = ["#a855f7", "#67e8f9", "#f0d78c", "#4f46e5"];
          return (
            <motion.span
              key={i}
              className="absolute top-1/2 left-1/2 h-2 w-2 rounded-sm"
              style={{ background: colors[i % colors.length] }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0 }}
              animate={{
                x: (Math.random() - 0.5) * 800,
                y: (Math.random() - 0.5) * 600,
                rotate: Math.random() * 720,
                opacity: 0,
                scale: 1,
              }}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: Math.random() * 0.2 }}
            />
          );
        })}
      </div>
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
        className="glass-strong relative z-10 max-w-md rounded-3xl p-10 text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet to-cyan shadow-[0_0_60px_-10px_oklch(0.7_0.24_300/80%)]">
          <Check className="h-8 w-8 text-black" strokeWidth={3} />
        </div>
        <h3 className="mt-6 font-display text-3xl text-white">Brief received.</h3>
        <p className="mt-3 text-sm text-white/60">
          A creative director will personally reach out within 24 hours with a tailored proposal. Your estimated investment is{" "}
          <span className="text-aurora font-semibold">${price.toLocaleString()}</span>.
        </p>
        <button onClick={onClose} className="btn-ghost-line mt-7 rounded-full px-6 py-2.5 text-sm">Close</button>
      </motion.div>
    </motion.div>
  );
}
