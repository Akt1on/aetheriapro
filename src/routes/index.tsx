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
      { title: "Aetheria — Цифровые миры, которые чувствуют." },
      { name: "description", content: "Премиальная цифровая студия. Создаём кинематографичные сайты, иммерсивные 3D-опыты и AI-интерфейсы с безупречной производительностью." },
      { property: "og:title", content: "Aetheria — Цифровые миры, которые чувствуют." },
      { property: "og:description", content: "Кинематографичные сайты, иммерсивный 3D, AI-интерфейсы." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="dark relative min-h-screen text-foreground">
      <div className="fixed inset-0 -z-20 bg-background" />
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
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at top, oklch(0.18 0.06 268) 0%, oklch(0.06 0.02 265) 70%)" }} />
      <div className="absolute inset-0">
        <ParticleField density={240} />
      </div>
      <div className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }} />
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
    ["Услуги", "#services"],
    ["Конфигуратор", "#configurator"],
    ["Работы", "#work"],
    ["Процесс", "#process"],
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
        <a href="#configurator" className="btn-primary-glow inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-medium sm:px-5">
          <span className="hidden sm:inline">Начать проект</span><span className="sm:hidden">Начать</span> <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.header>
  );
}

function Logo() {
  return (
    <div className="relative h-7 w-7">
      <div className="absolute inset-0 rounded-md"
        style={{ background: "conic-gradient(from 120deg, oklch(0.55 0.25 270), oklch(0.7 0.24 300), oklch(0.82 0.16 215), oklch(0.55 0.25 270))" }} />
      <div className="absolute inset-[3px] rounded-[5px] bg-background" />
      <div className="absolute inset-[7px] rounded-sm bg-gradient-to-br from-violet to-cyan" />
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const headline = "Цифровые миры, которые чувствуют.";
  const words = headline.split(" ");
  return (
    <section id="top" className="relative pb-24 pt-36 md:pt-44 lg:pb-32">


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
            Открыт набор на III квартал 2026
          </motion.div>

          <h1 className="mt-7 font-display text-[clamp(2.25rem,7vw,6rem)] font-normal leading-[1.05] tracking-tight text-white">
            {words.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-3 align-bottom">
                <motion.span
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.1 }}
                  className={`inline-block ${i >= words.length - 2 ? "text-aurora italic" : ""}`}
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
            Мы проектируем и создаём выдающиеся сайты — соединяя real-time 3D, генеративный AI и
            маниакальную производительность, чтобы рождать цифровой опыт, который трогает людей,
            а не просто пиксели.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a href="#configurator" className="btn-primary-glow group inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm">
              Открыть конфигуратор проекта
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#work" className="btn-ghost-line group inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm">
              Смотреть работы
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.5 }}
            className="mt-14 grid max-w-md grid-cols-3 gap-4 sm:gap-6"
          >
            {[["180+", "Запущенных проектов"], ["28", "Отраслевых наград"], ["100/100", "Средний Lighthouse"]].map(([n, l]) => (
              <div key={l} className="min-w-0">
                <div className="font-display text-xl sm:text-3xl text-white">{n}</div>
                <div className="mt-1 text-[10px] sm:text-xs uppercase tracking-widest text-white/40">{l}</div>
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
        <div className="text-xs uppercase tracking-[0.4em] text-white/35">Признание самых требовательных жюри мира</div>
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
    { icon: Sparkles, title: "Премиум-лендинги", desc: "Кинематографичные одностраничники, созданные вдохновлять и конвертировать.", tag: "от 30 000 ₽" },
    { icon: Globe, title: "Корпоративные сайты", desc: "Многостраничные бренд-системы с редакционным вниманием к деталям.", tag: "от 80 000 ₽" },
    { icon: ShoppingBag, title: "E-commerce с 3D", desc: "Миры товаров, через которые можно пройти. Витрины, рассказывающие истории.", tag: "от 150 000 ₽" },
    { icon: Cpu, title: "PWA и веб-приложения", desc: "Производительные, устанавливаемые продукты, которые ощущаются как нативные.", tag: "от 250 000 ₽" },
    { icon: Boxes, title: "Иммерсивные продукты", desc: "WebGL, AI, генеративное — уникальные моменты, которые умеем только мы.", tag: "по запросу" },
  ];
  return (
    <section id="services" className="relative py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Услуги"
          title={<>Отточенные дисциплины.<br/><span className="text-aurora italic">Никаких шаблонов.</span></>}
          subtitle="Пять сфокусированных направлений — одна студия. Каждое сделано с одним и тем же одержимым стандартом."
        />

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
    <section id="configurator" className="relative py-20 sm:py-32">
      <div className="absolute inset-x-0 top-0 h-px hairline" />
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Конфигуратор"
          title={<>Соберите свой <span className="text-aurora italic">цифровой опыт.</span></>}
          subtitle="Соберите проект за четыре шага. Увидите, как он оживает в реальном времени, и получите честную оценку бюджета ещё до первого разговора."
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
  {
    name: "Lumen Atelier", category: "Люкс-мода · E-commerce", year: "2026", colors: ["#1a1a1a", "#c9a84c"],
    task: "Перенести оффлайн-бутик в онлайн без потери ощущения ручной работы.",
    solution: "Каталог с мягкой 3D-витриной, тёплая типографика, чекаут в один экран.",
    result: "+38% к конверсии, средний чек вырос на 24%.",
  },
  {
    name: "Nova Aerospace", category: "Аэрокосмос · Корпоративный", year: "2026", colors: ["#0a0a1a", "#67e8f9"],
    task: "Объяснить сложный продукт инвесторам и инженерам одновременно.",
    solution: "Сценарный сторителлинг по скроллу, интерактивные схемы, EN/RU.",
    result: "Время на странице ×2.1, +47% к заявкам на демо.",
  },
  {
    name: "Hyperion AI", category: "SaaS · Веб-приложение", year: "2025", colors: ["#16213e", "#a78bfa"],
    task: "Поднять активацию после регистрации в B2B SaaS.",
    solution: "Новый онбординг из 4 шагов, интерактивный дашборд, тёмная тема.",
    result: "Активация выросла с 31% до 58% за два месяца.",
  },
  {
    name: "Atelier Verde", category: "Ресторан · Лендинг", year: "2025", colors: ["#1a3c2a", "#a0c49d"],
    task: "Увеличить онлайн-бронирования и снизить нагрузку на хостес.",
    solution: "Лендинг-меню с атмосферой места, бронь в 2 тапа, интеграция с iiko.",
    result: "+62% онлайн-броней, звонки сократились на треть.",
  },
  {
    name: "Forma Studio", category: "Архитектура · Портфолио", year: "2025", colors: ["#2d2d2d", "#e85d3a"],
    task: "Сделать портфолио, которое продаёт проекты от 30 млн ₽.",
    solution: "Кейсы-длинноформы, кинематографичные обложки, медленный ритм.",
    result: "5 крупных контрактов за квартал, средний бюджет +40%.",
  },
  {
    name: "Polaris Bank", category: "Финтех · PWA", year: "2024", colors: ["#0f1b3d", "#3b6fa0"],
    task: "Заменить мобильный сайт без жертв по скорости и доступности.",
    solution: "PWA на edge, офлайн-режим, аудит a11y по WCAG 2.2 AA.",
    result: "Lighthouse 98+, отказы на мобильных −29%.",
  },
];

function Work() {
  return (
    <section id="work" className="relative py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Избранные работы"
          title={<>Наши <span className="text-aurora italic">одержимости.</span></>}
          subtitle="Маленький, продуманный портфель. Каждый запуск — признание в любви к ремеслу."
        />

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

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-6">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/50">{project.category} · {project.year}</div>
            <div className="mt-1.5 font-display text-2xl text-white">{project.name}</div>
            <div className="mt-1 text-xs text-cyan">{project.result.split(",")[0]}</div>
          </div>
          <motion.div
            className="glass-strong flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            animate={{ scale: hover ? 1.1 : 1, rotate: hover ? 45 : 0 }}
          >
            <ArrowUpRight className="h-4 w-4 text-white" />
          </motion.div>
        </div>

        <motion.div
          initial={false}
          animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : 12, height: hover ? "auto" : 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="glass-strong mt-4 rounded-2xl p-4 text-xs leading-relaxed text-white/85">
            <div><span className="text-cyan">Задача.</span> {project.task}</div>
            <div className="mt-1.5"><span className="text-cyan">Решение.</span> {project.solution}</div>
            <div className="mt-1.5"><span className="text-gold">Результат.</span> {project.result}</div>
          </div>
        </motion.div>
      </div>
    </motion.a>
  );
}

/* ---------- Process ---------- */
function Process() {
  const steps = [
    { n: "01", t: "Исследование", d: "Глубокий аудит бренда, бизнес-модели и амбиций. Сначала мы слушаем." },
    { n: "02", t: "Направление", d: "Три отрисованных креативных направления — не мудборды, а живые пиксели." },
    { n: "03", t: "Дизайн", d: "Идеальные до пикселя системы с движением, заложенным с первого кадра." },
    { n: "04", t: "Инженерия", d: "Код, написанный руками. WebGL, AI, edge — выбраны ради смысла, а не модного слова." },
    { n: "05", t: "Запуск", d: "Аудит производительности, проверка доступности и поддержка задолго после релиза." },
  ];
  return (
    <section id="process" className="relative py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Процесс"
          title={<>От первого брифа до <span className="text-aurora italic">финального пикселя.</span></>}
          subtitle="Дисциплинированный, прозрачный процесс, созданный для амбициозных команд."
        />

        <div className="relative mt-20">
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
                <div className="absolute left-0 top-1.5 flex h-10 w-10 items-center justify-center rounded-full glass-strong md:left-1/2 md:-translate-x-1/2">
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
    { icon: Zap, t: "Производительность прежде всего", d: "Средний Lighthouse 98+. У красоты нет права быть медленной." },
    { icon: Code2, t: "Сделано вручную", d: "Каждая строка кода — наша. Никаких раздутых конструкторов и шаблонов." },
    { icon: Sparkles, t: "Движение в основе", d: "Анимация — не украшение, а часть смысла, который мы проектируем." },
    { icon: Layers, t: "Только синьоры", d: "Шесть мастеров. Никаких джунов. Каждый проект ведут директора." },
  ];
  return (
    <section className="relative py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="glass-strong relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 md:p-16">
          <div className="aurora-bg opacity-50" />
          <div className="relative grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <div className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/40">Почему Aetheria</div>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-white">
                Другие студии делают сайты.<br/><span className="text-aurora italic">Мы создаём ощущения.</span>
              </h2>
              <p className="mt-6 max-w-md text-white/55">
                Веб никогда не был таким перенасыщенным. Чтобы выделиться, нужен не просто дизайн —
                нужен момент. Мы создаём моменты, которые запоминают.
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
    <section ref={ref} className="relative overflow-hidden py-24 sm:py-40">
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
          className="font-display text-[clamp(2.5rem,9vw,8rem)] font-normal leading-[0.95] tracking-tight text-white"
        >
          Создадим то, что <span className="text-aurora italic">невозможно забыть.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mx-auto mt-7 max-w-xl text-lg text-white/60"
        >
          Мы берём в работу четыре проекта в квартал. Если ваши амбиции совпадают с нашими — давайте говорить.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a href="#configurator" className="btn-primary-glow group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm">
            Начать проект <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a href="mailto:studio@aetheria.ru" className="btn-ghost-line rounded-full px-8 py-4 text-sm">studio@aetheria.ru</a>
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
          <span className="ml-3 text-xs text-white/40">© 2026 — Создано в пустоте.</span>
        </div>
        <div className="flex gap-6 text-xs text-white/50">
          <a href="#" className="hover:text-white">Telegram</a>
          <a href="#" className="hover:text-white">Behance</a>
          <a href="#" className="hover:text-white">VK</a>
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
      <div className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-white/40">{eyebrow}</div>
      <h2 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-white">{title}</h2>
      {subtitle && <p className="mt-5 max-w-2xl text-base sm:text-lg text-white/55">{subtitle}</p>}
    </motion.div>
  );
}
