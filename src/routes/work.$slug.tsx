import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { fetchProjects, slugify, FALLBACK_PROJECTS, type PublicProject } from "@/lib/public-content";

const CustomCursor = lazy(() => import("@/components/aetheria/CustomCursor").then((m) => ({ default: m.CustomCursor })));
const SmoothScroll = lazy(() => import("@/components/aetheria/SmoothScroll").then((m) => ({ default: m.SmoothScroll })));


export const Route = createFileRoute("/work/$slug")({
  head: ({ params }) => {
    const p = FALLBACK_PROJECTS.find((x) => slugify(x.name) === params.slug);
    const title = p ? `${p.name} — кейс Aetheria` : "Кейс — Aetheria";
    const desc = p ? `${p.task} ${p.result}` : "Избранный проект студии Aetheria: задача, решение и результат.";
    const url = `https://aetheriapro.lovable.app/work/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 158) },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: CaseStudy,
});

function CaseStudy() {
  const { slug } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["public", "projects"],
    queryFn: fetchProjects,
    staleTime: 60_000,
    initialData: FALLBACK_PROJECTS,
  });
  const projects: PublicProject[] = data ?? FALLBACK_PROJECTS;
  const project = projects.find((p) => slugify(p.name) === slug);
  const others = projects.filter((p) => slugify(p.name) !== slug).slice(0, 2);

  if (!project) {
    return (
      <div className="dark relative flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
        <h1 className="font-display text-4xl text-white">Кейс не найден</h1>
        <p className="text-white/50">Возможно, проект ещё не опубликован.</p>
        <Link to="/" className="glass-strong rounded-full px-6 py-3 text-sm text-white/85">На главную</Link>
      </div>
    );
  }

  const c1 = project.color_primary;
  const c2 = project.color_accent;

  return (
    <div className="dark relative min-h-screen bg-background text-foreground">
      <div className="noise" />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: `radial-gradient(ellipse at top, ${c2}22 0%, oklch(0.06 0.02 265) 65%)` }}
      />

      <header className="mx-auto max-w-5xl px-6 pt-10">
        <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/45 transition-colors hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Aetheria
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-14 pt-14 sm:pt-24">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <div className="text-[10px] uppercase tracking-[0.35em] text-white/45">{project.category} · {project.year}</div>
          <h1 className="mt-5 font-display text-[13vw] leading-[0.95] text-white sm:text-7xl">{project.name}</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">{project.task}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 aspect-[16/10] overflow-hidden rounded-3xl ring-1 ring-white/10"
          style={{ background: `linear-gradient(160deg, ${c1}, ${c2}55, ${c1})`, boxShadow: `0 60px 120px -40px ${c2}66` }}
        >
          <div className="flex h-full items-center justify-center">
            <div
              className="h-3/5 w-4/5 rounded-2xl ring-1 ring-white/20"
              style={{ background: `radial-gradient(circle at 30% 30%, ${c2}, ${c1})` }}
            />
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-8">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { k: "Задача", v: project.task, accent: "text-cyan" },
            { k: "Решение", v: project.solution, accent: "text-violet" },
            { k: "Результат", v: project.result, accent: "text-gold" },
          ].map((b, i) => (
            <motion.div
              key={b.k}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="glass rounded-3xl p-6"
            >
              <div className={`text-[10px] uppercase tracking-[0.3em] ${b.accent}`}>{b.k}</div>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{b.v}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-[10px] uppercase tracking-[0.35em] text-white/40">Другие кейсы</div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {others.map((p) => (
            <Link
              key={p.id}
              to="/work/$slug"
              params={{ slug: slugify(p.name) }}
              className="group glass flex items-center justify-between gap-4 rounded-2xl p-6 transition-colors hover:bg-white/[0.07]"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">{p.category}</div>
                <div className="mt-1 font-display text-xl text-white">{p.name}</div>
              </div>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-white/50 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white" />
            </Link>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start gap-5 rounded-3xl border border-white/10 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-display text-2xl text-white">Хотите такой же результат?</div>
            <p className="mt-2 text-sm text-white/55">Соберите проект в конфигураторе — оценка за минуту.</p>
          </div>
          <Link
            to="/"
            hash="configurator"
            className="rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
          >
            Открыть конфигуратор
          </Link>
        </div>
      </section>
    </div>
  );
}
