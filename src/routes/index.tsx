import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Award, Cpu, Layers, ShoppingBag, Sparkles, Zap, Code2, Globe, Boxes } from "lucide-react";
import { ParticleField } from "@/components/aetheria/ParticleField";
import { HeroScene } from "@/components/aetheria/HeroScene";
import { Configurator } from "@/components/aetheria/Configurator";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aetheria — Digital worlds that feel." },
      { name: "description", content: "A high-end digital studio crafting cinematic websites, immersive 3D experiences, and AI-powered interfaces with flawless performance." },
      { property: "og:title", content: "Aetheria — Digital worlds that feel." },
      { property: "og:description", content: "Cinematic websites, immersive 3D, AI-powered interfaces." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="dark relative min-h-screen bg-background text-foreground">
      <div className="noise" />
      <BackgroundAura />
      <Nav />
      <Hero />
      <TrustBar />
      <Services />
      <ConfiguratorSection />
      <Work />
      <Process />
      <WhyAetheria />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ---------- Background ---------- */
function BackgroundAura() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at top, oklch(0.18 0.06 268) 0%, oklch(0.08 0.02 265) 60%)" }} />
      <div
        className="absolute -top-40 left-1/2 h-[700px] w-[1100px] -translate-x-1/2 rounded-full opacity-50"
        style={{ background: "radial-gradient(closest-side, oklch(0.55 0.25 270 / 50%), transparent 70%)", filter: "blur(40px)" }}
      />
      <div
        className="absolute top-[40%] -right-32 h-[500px] w-[500px] rounded-full opacity-40"
        style={{ background: "radial-gradient(closest-side, oklch(0.78 0.18 215 / 50%), transparent 70%)", filter: "blur(40px)" }}
      />
      <div
        className="absolute top-[80%] -left-32 h-[500px] w-[500px] rounded-full opacity-30"
        style={{ background: "radial-gradient(closest-side, oklch(0.7 0.24 300 / 50%), transparent 70%)", filter: "blur(40px)" }}
      />
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
    </div>
  );
}

/* ---------- Nav ---------- */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const items = [
    ["Services", "#services"],
    ["Configurator", "#configurator"],
    ["Work", "#work"],
    ["Process", "#process"],
  ];
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed left-1/2 top-4 z-50 w-[min(96%,1180px)] -translate-x-1/2 rounded-full px-5 py-2.5 transition-all duration-500 ${
        scrolled ? "glass-strong" : "border border-white/5 bg-white/[0.02] backdrop-blur-md"
      }`}
    >
      <div className="flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-xl tracking-tight text-white">Aetheria</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {items.map(([label, href]) => (
            <a key={href} href={href} className="group relative text-sm text-white/70 transition hover:text-white">
              {label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-violet to-cyan transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <a href="#configurator" className="btn-primary-glow inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-medium">
          Start a project <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.header>
  );
}

function Logo() {
  return (
    <div className="relative h-7 w-7">
      <div
        className="absolute inset-0 rounded-md"
        style={{ background: "conic-gradient(from 120deg, oklch(0.55 0.25 270), oklch(0.7 0.24 300), oklch(0.82 0.16 215), oklch(0.55 0.25 270))" }}
      />
      <div className="absolute inset-[3px] rounded-[5px] bg-background" />
      <div className="absolute inset-[7px] rounded-sm bg-gradient-to-br from-violet to-cyan" />
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const headline = "Digital worlds that feel.";
  const words = headline.split(" ");
  return (
    <section id="top" className="relative pb-24 pt-36 md:pt-44 lg:pb-32">
      <div className="absolute inset-0 -z-10">
        <ParticleField density={70} />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-white/70"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
            </span>
            Now booking Q3 · 2026
          </motion.div>

          <h1 className="mt-7 font-display text-[clamp(3rem,8vw,6.5rem)] font-normal leading-[0.95] tracking-tight text-white">
            {words.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden align-bottom">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.12 }}
                  className={`inline-block ${i === words.length - 1 ? "text-aurora italic" : ""}`}
                >
                  {w}&nbsp;
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-white/65"
          >
            We design and engineer extraordinary websites — fusing real-time 3D, generative AI, and
            obsessive performance to create digital experiences that move people, not just pixels.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a href="#configurator" className="btn-primary-glow group inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm">
              Open Project Configurator
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#work" className="btn-ghost-line group inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm">
              Explore Our Work
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.5 }}
            className="mt-14 grid max-w-md grid-cols-3 gap-6"
          >
            {[["180+", "Crafted launches"], ["28", "Industry awards"], ["100/100", "Avg. Lighthouse"]].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-3xl text-white">{n}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-white/40">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroScene />
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Trust Bar ---------- */
function TrustBar() {
  const items = ["Awwwards SOTD", "FWA of the Day", "CSS Design Awards", "The Webby Awards", "Communication Arts", "Brand New", "Lovie Awards", "ADC Awards"];
  return (
    <section className="relative border-y border-white/5 py-10">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <div className="text-xs uppercase tracking-[0.4em] text-white/35">Recognized by the world's most demanding juries</div>
      </div>
      <div className="relative mt-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />
        <div className="marquee-track flex w-max gap-16">
          {[...items, ...items].map((it, i) => (
            <div key={i} className="flex items-center gap-3 whitespace-nowrap text-base font-medium text-white/55">
              <Award className="h-4 w-4 text-gold" />
              {it}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Services ---------- */
function Services() {
  const services = [
    { icon: Sparkles, title: "Signature Landing Pages", desc: "Cinematic single-page sites engineered to convert and inspire.", tag: "From $18k" },
    { icon: Globe, title: "Corporate Digital Experiences", desc: "Multi-page brand systems with editorial craft and depth.", tag: "From $38k" },
    { icon: ShoppingBag, title: "E-commerce with 3D", desc: "Product worlds you can walk through. Storefronts that sell stories.", tag: "From $62k" },
    { icon: Cpu, title: "PWA & Web Applications", desc: "Performant, installable product experiences that feel native.", tag: "From $85k" },
    { icon: Boxes, title: "Custom Immersive Products", desc: "WebGL, AI, generative — bespoke moments only we can build.", tag: "On request" },
  ];
  return (
    <section id="services" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Services" title={<>Crafted disciplines.<br/><span className="text-aurora italic">No templates.</span></>}
          subtitle="Five focused practices, one studio — each engineered with the same obsessive standard." />

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <ServiceCard key={s.title} {...s} index={i} large={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ icon: Icon, title, desc, tag, index, large }: { icon: any; title: string; desc: string; tag: string; index: number; large?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 14, y: ((e.clientY - r.top) / r.height - 0.5) * -14 });
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ perspective: "1000px" }}
      className={`group relative ${large ? "lg:col-span-1 lg:row-span-1" : ""}`}
    >
      <div
        className="glass relative h-full overflow-hidden rounded-3xl p-7 transition-transform duration-500"
        style={{ transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`, transformStyle: "preserve-3d" }}
      >
        {/* Hover aurora */}
        <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), oklch(0.7 0.24 300 / 18%), transparent 60%)" }} />

        <div className="relative flex h-full flex-col" style={{ transform: "translateZ(40px)" }}>
          <div className="glass-strong flex h-14 w-14 items-center justify-center rounded-2xl">
            <Icon className="h-6 w-6 text-cyan" />
          </div>
          <h3 className="mt-6 font-display text-2xl text-white">{title}</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">{desc}</p>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-gold">{tag}</span>
            <ArrowUpRight className="h-4 w-4 text-white/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Configurator Section ---------- */
function ConfiguratorSection() {
  return (
    <section id="configurator" className="relative py-32">
      <div className="absolute inset-x-0 top-0 h-px hairline" />
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="The Configurator"
          title={<>Build your <span className="text-aurora italic">digital experience.</span></>}
          subtitle="Compose your project in four steps. Watch it come alive in real-time, with an honest investment estimate before you ever talk to us."
        />
        <div className="mt-14">
          <Configurator />
        </div>
      </div>
    </section>
  );
}

/* ---------- Work ---------- */
const PROJECTS = [
  { name: "Lumen Atelier", category: "Luxury Fashion · E-commerce 3D", metric: "+312% conversion", year: "2026", colors: ["#1a1a1a", "#c9a84c"], pos: { left: "8%", top: "30%" } },
  { name: "Nova Aerospace", category: "Aerospace · Corporate", metric: "Awwwards SOTD", year: "2026", colors: ["#0a0a1a", "#67e8f9"], pos: { right: "12%", top: "20%" } },
  { name: "Hyperion AI", category: "AI Platform · Web App", metric: "Series B launch", year: "2025", colors: ["#16213e", "#a78bfa"], pos: { left: "12%", bottom: "25%" } },
  { name: "Atelier Verde", category: "Restaurant · Signature Page", metric: "FWA of the Day", year: "2025", colors: ["#1a3c2a", "#a0c49d"], pos: { right: "8%", bottom: "30%" } },
  { name: "Forma Studio", category: "Architecture · Portfolio", metric: "+8m organic reach", year: "2025", colors: ["#2d2d2d", "#e85d3a"], pos: { left: "40%", top: "12%" } },
  { name: "Polaris Bank", category: "Fintech · PWA", metric: "Lighthouse 100", year: "2024", colors: ["#0f1b3d", "#3b6fa0"], pos: { left: "40%", bottom: "12%" } },
];

function Work() {
  return (
    <section id="work" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Selected Work" title={<>Recent <span className="text-aurora italic">obsessions.</span></>}
          subtitle="A small, intentional roster. Every launch is a love letter to craft." />

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.name} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: typeof PROJECTS[number]; index: number }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative block aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-white/10"
      style={{ background: `linear-gradient(160deg, ${project.colors[0]}, ${project.colors[1]}55, ${project.colors[0]})` }}
    >
      {/* faux mock */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ scale: hover ? 1.08 : 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative h-3/5 w-4/5 rounded-2xl ring-1 ring-white/20"
          style={{
            background: `linear-gradient(140deg, ${project.colors[1]}99, ${project.colors[0]})`,
            boxShadow: `0 40px 80px -20px ${project.colors[1]}55`,
          }}
        >
          <motion.div
            className="absolute inset-6 rounded-xl"
            style={{ background: `radial-gradient(circle at 30% 30%, ${project.colors[1]}, ${project.colors[0]})` }}
            animate={{ rotate: hover ? 6 : 0 }}
            transition={{ duration: 1.2 }}
          />
          <div className="absolute bottom-4 left-4 right-4 h-2 rounded-full bg-white/30" />
          <div className="absolute bottom-9 left-4 h-2 w-1/2 rounded-full bg-white/20" />
        </div>
      </motion.div>

      {/* overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/50">{project.category} · {project.year}</div>
            <div className="mt-1.5 font-display text-2xl text-white">{project.name}</div>
            <div className="mt-1 text-xs text-cyan">{project.metric}</div>
          </div>
          <motion.div
            className="glass-strong flex h-10 w-10 items-center justify-center rounded-full"
            animate={{ scale: hover ? 1.1 : 1, rotate: hover ? 45 : 0 }}
          >
            <ArrowUpRight className="h-4 w-4 text-white" />
          </motion.div>
        </div>
      </div>
    </motion.a>
  );
}

/* ---------- Process ---------- */
function Process() {
  const steps = [
    { n: "01", t: "Discover", d: "Deep audit of brand, business model, and ambition. We listen first." },
    { n: "02", t: "Direct", d: "Three rendered creative directions — never moodboards, always working pixels." },
    { n: "03", t: "Design", d: "Pixel-perfect systems with motion baked in from the first frame." },
    { n: "04", t: "Engineer", d: "Hand-crafted code. WebGL, AI, edge — chosen for the story, not the buzzword." },
    { n: "05", t: "Launch", d: "Performance-audited, accessibility-checked, championed by us long after release." },
  ];
  return (
    <section id="process" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Process" title={<>From first brief to <span className="text-aurora italic">final pixel.</span></>}
          subtitle="A disciplined, transparent process designed for ambitious teams." />

        <div className="relative mt-20">
          {/* vertical line */}
          <div className="absolute left-[19px] top-0 h-full w-px bg-gradient-to-b from-violet/60 via-cyan/40 to-transparent md:left-1/2" />
          <div className="space-y-12">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: i % 2 ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={`relative grid items-center gap-6 md:grid-cols-2 ${i % 2 ? "md:[direction:rtl]" : ""}`}
              >
                <div className={`pl-14 md:pl-0 md:[direction:ltr] ${i % 2 ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                  <div className="font-mono text-xs text-cyan">{s.n}</div>
                  <h3 className="mt-2 font-display text-3xl text-white md:text-4xl">{s.t}</h3>
                  <p className="mt-3 text-white/55">{s.d}</p>
                </div>
                <div className="hidden md:block" />
                <div
                  className="absolute left-0 top-1.5 flex h-10 w-10 items-center justify-center rounded-full glass-strong md:left-1/2 md:-translate-x-1/2"
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet to-cyan shadow-[0_0_20px_4px_oklch(0.7_0.24_300/70%)]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Why Aetheria ---------- */
function WhyAetheria() {
  const points = [
    { icon: Zap, t: "Performance-first", d: "Average 98+ Lighthouse. Beauty has no excuse to be slow." },
    { icon: Code2, t: "Hand-engineered", d: "Every line of code is ours. No bloated builders, no templates." },
    { icon: Sparkles, t: "Motion-native", d: "Animation isn't decoration — it's part of the meaning we design." },
    { icon: Layers, t: "Senior-only team", d: "Six artisans. No juniors. Every project touched by directors." },
  ];
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="glass-strong relative overflow-hidden rounded-[2.5rem] p-10 md:p-16">
          <div className="aurora-bg opacity-50" />
          <div className="relative grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-white/40">Why Aetheria</div>
              <h2 className="mt-4 font-display text-5xl leading-[1] text-white md:text-6xl">
                Other studios ship websites.<br/><span className="text-aurora italic">We ship feelings.</span>
              </h2>
              <p className="mt-6 max-w-md text-white/55">
                The web has never been more saturated. To stand out, you need more than design — you need
                a moment. We build moments people remember.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {points.map((p, i) => (
                <motion.div
                  key={p.t}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="glass rounded-2xl p-6"
                >
                  <p.icon className="h-5 w-5 text-cyan" />
                  <div className="mt-4 font-display text-xl text-white">{p.t}</div>
                  <div className="mt-2 text-sm text-white/55">{p.d}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */
function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  return (
    <section ref={ref} className="relative overflow-hidden py-40">
      <motion.div style={{ y }} className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(closest-side, oklch(0.7 0.24 300 / 50%), transparent 70%)", filter: "blur(50px)" }} />
      </motion.div>
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(3rem,10vw,8rem)] font-normal leading-[0.9] tracking-tight text-white"
        >
          Let's build something <span className="text-aurora italic">unforgettable.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mx-auto mt-7 max-w-xl text-lg text-white/60"
        >
          We accept four engagements per quarter. If your ambition matches ours, let's talk.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a href="#configurator" className="btn-primary-glow group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm">
            Start your project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a href="mailto:studio@aetheria.dev" className="btn-ghost-line rounded-full px-8 py-4 text-sm">studio@aetheria.dev</a>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-lg text-white">Aetheria</span>
          <span className="ml-3 text-xs text-white/40">© 2026 — Crafted in the void.</span>
        </div>
        <div className="flex gap-6 text-xs text-white/50">
          <a href="#" className="hover:text-white">Instagram</a>
          <a href="#" className="hover:text-white">Are.na</a>
          <a href="#" className="hover:text-white">LinkedIn</a>
          <a href="#" className="hover:text-white">Awwwards</a>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Shared ---------- */
function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: React.ReactNode; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-3xl"
    >
      <div className="text-xs uppercase tracking-[0.4em] text-white/40">{eyebrow}</div>
      <h2 className="mt-4 font-display text-5xl leading-[1.02] tracking-tight text-white md:text-6xl">{title}</h2>
      {subtitle && <p className="mt-5 max-w-2xl text-lg text-white/55">{subtitle}</p>}
    </motion.div>
  );
}
