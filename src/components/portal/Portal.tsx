import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ParticleField } from "@/components/aetheria/ParticleField";
import { SoundToggle } from "@/components/aetheria/SoundToggle";
import { P_TYPES, P_STYLES, P_FEATURES, P_TIMES, T, LANG_CURRENCY, formatMoney, portalPriceRub, type Lang } from "@/lib/portal";
import { playClick, playStep, playSuccess } from "@/lib/sound";
import { submitLead } from "@/lib/leads-client";
import { FALLBACK_PROJECTS, slugify } from "@/lib/public-content";

const KEY = "aetheria-portal";
type State = { lang: Lang; step: number; type: string; style: string; features: string[]; time: string };
const INIT: State = { lang: "hy", step: 1, type: "", style: "", features: [], time: "std" };
const LANGS: { id: Lang; label: string; sub: string }[] = [
  { id: "hy", label: "Հայերեն", sub: "AMD ֏" },
  { id: "ru", label: "Русский", sub: "RUB ₽" },
  { id: "en", label: "English", sub: "USD $" },
];

function Card({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`glass w-full rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 sm:p-5 ${active ? "border-primary bg-primary/15 shadow-[0_0_40px_-10px_var(--color-primary)]" : "border-border/40 hover:border-primary/50"}`}>
      {children}
    </button>
  );
}

export function Portal() {
  const [s, setS] = useState<State>(INIT);
  const [dir, setDir] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", website: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const t = T[s.lang];
  const cur = LANG_CURRENCY[s.lang];
  const price = portalPriceRub(s);

  useEffect(() => { try { const v = localStorage.getItem(KEY); if (v) setS({ ...INIT, ...JSON.parse(v) }); } catch { /* noop */ } }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* noop */ } document.documentElement.lang = s.lang; }, [s]);

  const canNext = s.step === 2 ? !!s.type : s.step === 3 ? !!s.style : s.step < 6;
  const go = (d: number) => {
    const n = s.step + d;
    if (n < 1 || n > 6 || (d > 0 && !canNext)) return;
    setDir(d); playStep(); setS({ ...s, step: n });
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "Enter") go(1);
      if (e.key === "Backspace" || e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  });
  const set = (p: Partial<State>, auto = false) => {
    playClick(); const n = { ...s, ...p };
    if (auto) { setDir(1); n.step = s.step + 1; }
    setS(n);
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(form.email)) { setStatus("err"); return; }
    setStatus("sending");
    try {
      await submitLead({ name: form.name || null, email: form.email, company: form.phone || null, website: form.website,
        project_type: s.type, design_style: s.style, capabilities: s.features, scope: s.time, estimated_price: price });
      playSuccess(); setStatus("ok");
    } catch { setStatus("err"); }
  };
  const reset = () => { setS({ ...INIT, lang: s.lang, step: 2 }); setStatus("idle"); setForm({ name: "", phone: "", email: "", website: "" }); };

  const body = useMemo(() => {
    if (status === "ok") return (
      <div className="text-center">
        <h2 className="font-display text-5xl sm:text-7xl">{t.ok_t}</h2>
        <p className="mt-4 text-muted-foreground">{t.ok_s}</p>
        <button onClick={reset} className="mt-8 rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background">{t.again}</button>
      </div>
    );
    switch (s.step) {
      case 1: return (
        <div className="grid gap-3 sm:grid-cols-3">
          {LANGS.map((l) => <Card key={l.id} active={s.lang === l.id} onClick={() => set({ lang: l.id }, true)}>
            <div className="font-display text-3xl">{l.label}</div><div className="mt-1 text-xs text-muted-foreground">{l.sub}</div></Card>)}
        </div>);
      case 2: return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {P_TYPES.map((p) => <Card key={p.id} active={s.type === p.id} onClick={() => set({ type: p.id }, true)}>
            <div className="text-lg font-medium">{t[p.id]}</div><div className="text-sm text-muted-foreground">{t[p.id + "_d"]}</div>
            <div className="mt-3 font-mono text-xs text-primary">{formatMoney(p.base, cur)}+</div></Card>)}
        </div>);
      case 3: return (
        <div className="grid gap-3 sm:grid-cols-2">
          {P_STYLES.map((p) => <Card key={p.id} active={s.style === p.id} onClick={() => set({ style: p.id }, true)}>
            <div className="mb-3 flex gap-1.5">{p.colors.map((c) => <span key={c} className="h-6 w-6 rounded-full border border-border/40" style={{ background: c }} />)}</div>
            <div className="text-lg font-medium">{t[p.id]}</div><div className="text-sm text-muted-foreground">{t[p.id + "_d"]}</div></Card>)}
        </div>);
      case 4: return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {P_FEATURES.map((f) => { const on = s.features.includes(f.id); return <Card key={f.id} active={on}
            onClick={() => set({ features: on ? s.features.filter((x) => x !== f.id) : [...s.features, f.id] })}>
            <div className="font-medium">{t["f_" + f.id]}</div><div className="mt-1 font-mono text-xs text-primary">+{formatMoney(f.add, cur)}</div></Card>; })}
        </div>);
      case 5: return (
        <div className="grid gap-3 sm:grid-cols-3">
          {P_TIMES.map((p) => <Card key={p.id} active={s.time === p.id} onClick={() => set({ time: p.id }, true)}>
            <div className="text-lg font-medium">{t[p.id]}</div><div className="text-sm text-muted-foreground">{t[p.id + "_d"]}</div>
            <div className="mt-2 font-mono text-xs text-primary">×{p.mult}</div></Card>)}
        </div>);
      default: return (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-2xl border border-border/40 p-6 print:border-0">
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t.est}</div>
            <motion.div key={price + cur} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-5xl text-primary sm:text-6xl">{formatMoney(price, cur)}</motion.div>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              <li>{t[s.type]}</li><li>{t[s.style]}</li>
              <li>{s.features.map((f) => t["f_" + f]).join(", ") || "—"}</li><li>{t[s.time]} · {t[s.time + "_d"]}</li>
            </ul>
            <button onClick={() => window.print()} className="mt-5 rounded-full border border-border/60 px-5 py-2 text-xs print:hidden">{t.pdf}</button>
          </div>
          <form onSubmit={send} className="space-y-3 print:hidden">
            {(["name", "phone", "email"] as const).map((k) => (
              <input key={k} type={k === "email" ? "email" : "text"} required={k === "email"} placeholder={t[k]} value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="w-full rounded-xl border border-border/50 bg-background/40 px-4 py-3 text-sm outline-none focus:border-primary" />
            ))}
            <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            {status === "err" && <p className="text-sm text-destructive">{t.err}</p>}
            <button disabled={status === "sending"} className="w-full rounded-full bg-foreground py-3.5 text-sm font-medium text-background disabled:opacity-60">
              {status === "sending" ? t.sending : t.submit}</button>
          </form>
        </div>);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, status, form, t, cur, price]);

  const titles = ["s1", "s2", "s3", "s4", "s5", "s6"][s.step - 1];

  return (
    <div className="dark relative h-[100dvh] overflow-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0 print:hidden">
        <ParticleField density={180} />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full" style={{ background: "radial-gradient(circle at 30% 30%, oklch(0.6 0.2 290), oklch(0.15 0.05 270) 70%)", boxShadow: "0 0 120px oklch(0.5 0.2 290 / .4)", animation: "aeth-float-slow 30s ease-in-out infinite" }} />
        <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full" style={{ background: "radial-gradient(circle at 30% 30%, oklch(0.75 0.13 200), oklch(0.15 0.05 250) 70%)", boxShadow: "0 0 90px oklch(0.6 0.14 200 / .35)", animation: "aeth-float-slow 38s ease-in-out infinite reverse" }} />
      </div>

      <div className="relative z-10 flex h-full flex-col px-4 py-4 sm:px-10 sm:py-6">
        <header className="flex items-center justify-between gap-2 print:hidden">
          <div className="font-display text-2xl tracking-wide">Aetheria</div>
          <div className="flex items-center gap-2">
            <select aria-label="Language" value={s.lang} onChange={(e) => set({ lang: e.target.value as Lang })} className="rounded-full border border-border/50 bg-background/50 px-3 py-1.5 text-xs">
              {LANGS.map((l) => <option key={l.id} value={l.id}>{l.id.toUpperCase()}</option>)}
            </select>
            <SoundToggle />
            <button onClick={() => setDrawer(true)} className="rounded-full border border-border/50 px-4 py-1.5 text-xs">{t.portfolio}</button>
          </div>
        </header>

        <div className="mt-4 h-0.5 w-full overflow-hidden rounded bg-border/30 print:hidden">
          <motion.div className="h-full bg-primary" animate={{ width: `${(s.step / 6) * 100}%` }} />
        </div>

        <main className="flex flex-1 flex-col justify-center overflow-y-auto py-4">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={s.step + status} custom={dir}
              initial={{ opacity: 0, scale: 0.94, filter: "blur(12px)", y: dir * 30 }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, scale: 1.04, filter: "blur(12px)", y: dir * -30 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-4xl">
              {status !== "ok" && <div className="mb-6 text-center">
                <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">{t.step} {s.step} / 6</div>
                <h1 className="mt-2 font-display text-4xl leading-tight sm:text-6xl">{t[titles + "_t"]}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{t[titles + "_s"]}</p>
              </div>}
              {body}
            </motion.div>
          </AnimatePresence>
        </main>

        {status !== "ok" && <footer className="flex items-center justify-between print:hidden">
          <button onClick={() => go(-1)} disabled={s.step === 1} className="rounded-full border border-border/50 px-5 py-2.5 text-sm disabled:opacity-30">← {t.back}</button>
          {s.step < 6 && <button onClick={() => go(1)} disabled={!canNext} className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background disabled:opacity-30">{t.next} →</button>}
        </footer>}
      </div>

      <AnimatePresence>
        {drawer && <>
          <motion.div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="glass absolute right-0 top-0 z-30 h-full w-full max-w-md overflow-y-auto border-l border-border/40 p-6">
            <div className="mb-6 flex items-center justify-between"><h2 className="font-display text-3xl">{t.portfolio}</h2>
              <button onClick={() => setDrawer(false)} className="text-sm text-muted-foreground">{t.close} ✕</button></div>
            <div className="space-y-4">
              {FALLBACK_PROJECTS.map((p) => (
                <div key={p.id} className="rounded-2xl border border-border/40 p-5" style={{ background: `linear-gradient(135deg, ${p.color_primary}, transparent)` }}>
                  <div className="text-xs text-muted-foreground">{p.category} · {p.year}</div>
                  <div className="mt-1 font-display text-2xl">{p.name}</div>
                  <p className="mt-2 text-sm"><span className="text-muted-foreground">{t.task}: </span>{p.task}</p>
                  <p className="mt-1 text-sm" style={{ color: p.color_accent }}>{t.result}: {p.result}</p>
                  <Link to="/work/$slug" params={{ slug: slugify(p.name) }} className="mt-3 inline-block text-xs underline">{t.open} →</Link>
                </div>))}
            </div>
          </motion.aside>
        </>}
      </AnimatePresence>
    </div>
  );
}
