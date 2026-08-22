import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, animate } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ArrowRight, Sparkles, Layers, Zap, Clock, Share2 } from "lucide-react";
import { submitLead } from "@/lib/leads-client";
import { toast } from "sonner";
import { track } from "@/lib/analytics";
import { TYPES, STYLES, CAPS, SCOPES, calcPrice, type Selections } from "@/lib/pricing";

const STORAGE_KEY = "aetheria:configurator:v1";

function encodeSel(sel: unknown): string {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(sel)))); } catch { return ""; }
}
function decodeSel(s: string): unknown | null {
  try { return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch { return null; }
}

const STEPS = [
  { key: "type", label: "Тип проекта", icon: Layers },
  { key: "style", label: "Стиль дизайна", icon: Sparkles },
  { key: "caps", label: "Возможности", icon: Zap },
  { key: "scope", label: "Объём и сроки", icon: Clock },
] as const;

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 30, stiffness: 90 });
  const rounded = useTransform(spring, (v) => `${Math.round(v).toLocaleString("ru-RU")} ₽`);
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
  const [busy, setBusy] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "", company: "" });
  const honeypotRef = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);

  // Load from URL (?c=...) or localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("c");
    const raw = fromUrl ? decodeSel(fromUrl) : (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"); } catch { return null; }
    })();
    if (raw && typeof raw === "object") {
      const r = raw as Partial<Selections>;
      if (r.type && r.style && r.scope && Array.isArray(r.capabilities)) {
        setSel({ type: r.type, style: r.style, scope: r.scope, capabilities: r.capabilities });
        if (fromUrl) toast.success("Конфигурация загружена из ссылки");
      }
    }
    hydrated.current = true;
  }, []);

  // Persist to localStorage + sync URL
  useEffect(() => {
    if (!hydrated.current || typeof window === "undefined") return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sel)); } catch { /* quota */ }
    const encoded = encodeSel(sel);
    const url = new URL(window.location.href);
    url.searchParams.set("c", encoded);
    window.history.replaceState(null, "", url.toString());
  }, [sel]);

  const price = useMemo(() => calcPrice(sel), [sel]);

  const toggleCap = (id: string) =>
    setSel((s) => ({ ...s, capabilities: s.capabilities.includes(id) ? s.capabilities.filter((c) => c !== id) : [...s.capabilities, id] }));

  const styleObj = STYLES.find((s) => s.id === sel.style) ?? STYLES[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
      {/* Левая колонка: форма */}
      <div className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-10">
        <div className="aurora-bg opacity-40" />
        <div className="relative">
          <div className="mb-8 flex items-center gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <button key={s.key} onClick={() => setStep(i)} className="group flex items-center gap-2">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-500 ${
                      active
                        ? "border-violet bg-violet/20 text-white shadow-[0_0_30px_-5px_oklch(0.7_0.24_300/70%)]"
                        : done
                        ? "border-cyan/60 bg-cyan/10 text-cyan"
                        : "border-white/15 bg-white/5 text-white/70"
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
            <div className="text-xs uppercase tracking-[0.3em] text-white/70">Шаг 0{step + 1} / 04</div>
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
                      <div className="mt-1 text-sm text-white/70">{t.desc}</div>
                      <div className="mt-3 text-xs text-cyan/80">от {t.base.toLocaleString("ru-RU")} ₽</div>
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
                        <div className="text-xs text-cyan/80">+{c.add.toLocaleString("ru-RU")} ₽</div>
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
                        <div className="text-xs text-white/70">×{s.mult.toFixed(2)}</div>
                      </div>
                    </OptionCard>
                  ))}

                  <div className="glass mt-6 rounded-2xl p-5">
                    <div className="text-xs uppercase tracking-widest text-white/70">Краткое знакомство</div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className="rounded-lg bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none ring-1 ring-white/10 transition focus:ring-violet" placeholder="Имя" />
                      <input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} type="email" className="rounded-lg bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none ring-1 ring-white/10 transition focus:ring-violet" placeholder="Email" />
                      <input value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} className="rounded-lg bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none ring-1 ring-white/10 transition focus:ring-violet sm:col-span-2" placeholder="Компания" />
                      {/* Honeypot — hidden from real users, filled only by bots. */}
                      <input
                        ref={honeypotRef}
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }}
                      />
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
              ← Назад
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => { track("configurator_step", { step: step + 1, key: STEPS[step + 1]?.key ?? "", price }); setStep(step + 1); }} className="btn-primary-glow group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm">
                Продолжить <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <button
                onClick={async () => {
                  if (!contact.email || !contact.email.includes("@")) {
                    toast.error("Укажите корректный email");
                    return;
                  }
                  setBusy(true);
                  try {
                    await submitLead({
                      name: contact.name || null,
                      email: contact.email,
                      company: contact.company || null,
                      project_type: sel.type,
                      design_style: sel.style,
                      capabilities: sel.capabilities,
                      scope: sel.scope,
                      estimated_price: price,
                      website: honeypotRef.current?.value ?? "",
                    });
                    track("lead_submitted", { price, project_type: sel.type, scope: sel.scope, capabilities: sel.capabilities.join(",") });
                    setSubmitted(true);
                  } catch (e) {
                    toast.error((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
                disabled={busy}
                className="btn-primary-glow group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm disabled:opacity-60"
              >
                {busy ? "Отправка…" : "Отправить бриф"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Правая колонка: живой превью */}
      <div className="glass-strong relative overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="aurora-bg opacity-50" style={{ filter: "blur(60px)" }} />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/70">Живой превью</div>
              <div className="mt-1 font-display text-2xl text-white">Ваш проект</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-white/70">Бюджет</div>
              <div className="font-display text-3xl text-aurora">
                <AnimatedNumber value={price} />
              </div>
            </div>
          </div>

          <div className="relative mt-6 flex-1">
            <PreviewMock styleId={sel.style} caps={sel.capabilities} type={sel.type} />
          </div>

          <div className="mt-6">
            <div className="text-xs uppercase tracking-widest text-white/70">Палитра</div>
            <div className="mt-2 flex gap-2">
              {styleObj.colors.map((c) => (
                <motion.div key={c} layout className="h-8 flex-1 rounded-lg ring-1 ring-white/10" style={{ background: c }} />
              ))}
            </div>
            <button
              type="button"
              onClick={async () => {
                const url = new URL(window.location.href);
                url.searchParams.set("c", encodeSel(sel));
                url.hash = "configurator";
                try {
                  await navigator.clipboard.writeText(url.toString());
                  toast.success("Ссылка на конфигурацию скопирована");
                } catch {
                  toast.error("Не удалось скопировать ссылку");
                }
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/70 transition hover:border-violet/50 hover:bg-violet/10 hover:text-white"
            >
              <Share2 className="h-3.5 w-3.5" /> Поделиться конфигурацией
            </button>
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

  const headlines: Record<string, string> = {
    ecom: "Предметы желания.",
    app: "Создавайте по-настоящему.",
    landing: "Одна страница. Бесконечная глубина.",
    corp: "Бренды, которые движутся.",
  };

  return (
    <motion.div
      key={styleId + type}
      initial={{ opacity: 0, scale: 0.96, rotateX: 10 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-full min-h-[280px] overflow-hidden rounded-2xl ring-1 ring-white/10"
      style={{ background: p.bg, boxShadow: `0 30px 80px -20px ${p.glow}` }}
    >
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
          <div className="text-[10px] uppercase tracking-[0.3em] opacity-50" style={{ color: p.ink }}>aetheria · в эфире</div>
          <div className="mt-2 font-display text-2xl leading-tight md:text-3xl" style={{ color: p.ink }}>
            {headlines[type] ?? headlines.corp}
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
              <Sparkles className="h-3 w-3" style={{ color: p.accent }} /> AI-ассистент подключён
            </motion.div>
          )}
        </div>
      </div>

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
        <h3 className="mt-6 font-display text-3xl text-white">Бриф получен.</h3>
        <p className="mt-3 text-sm text-white/60">
          Креативный директор лично свяжется с вами в течение 24 часов с персональным предложением.
          Ориентировочный бюджет проекта — <span className="text-aurora font-semibold">{price.toLocaleString("ru-RU")} ₽</span>.
        </p>
        <button onClick={onClose} className="btn-ghost-line mt-7 rounded-full px-6 py-2.5 text-sm">Закрыть</button>
      </motion.div>
    </motion.div>
  );
}
