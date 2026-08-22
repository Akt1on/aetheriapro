import { useRef, useState } from "react";
import { motion } from "framer-motion";

type Member = {
  name: string;
  role: string;
  bio: string;
  initials: string;
  c1: string;
  c2: string;
};

const TEAM: Member[] = [
  {
    name: "Илья Ветров",
    role: "Creative Director",
    bio: "12 лет в дизайне. Ведёт визуальную концепцию: от арт-дирекшна до кинематографичной подачи.",
    initials: "ИВ",
    c1: "#6366f1",
    c2: "#a78bfa",
  },
  {
    name: "Соня Ким",
    role: "Lead Product Designer",
    bio: "Типографика, сетки, интерфейсные системы. Отвечает за то, чтобы красота работала на конверсию.",
    initials: "СК",
    c1: "#a78bfa",
    c2: "#67e8f9",
  },
  {
    name: "Марк Соловьёв",
    role: "WebGL / Tech Lead",
    bio: "Шейдеры, реалтайм-графика, 60 FPS на любом устройстве. Пишет то, что другие называют невозможным.",
    initials: "МС",
    c1: "#67e8f9",
    c2: "#22d3ee",
  },
  {
    name: "Аня Гордеева",
    role: "Head of Delivery",
    bio: "Сроки, коммуникация, прозрачность. С ней проект идёт по плану — и вы всегда знаете, что происходит.",
    initials: "АГ",
    c1: "#c9a84c",
    c2: "#ff8a5b",
  },
];

export function Team() {
  return (
    <section id="team" className="relative py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-white/70">Команда</div>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
            Небольшая студия. <span className="text-aurora italic">Большая одержимость.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-base text-white/70 sm:text-lg">
            Никаких прослоек и менеджеров-передатчиков. Над вашим проектом работают те, чьи имена вы видите ниже.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m, i) => (
            <TeamCard key={m.name} member={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCard({ member, index }: { member: Member; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 8, y: px * 8 });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      className="glass group relative overflow-hidden rounded-3xl p-6 transition-[transform,background-color] duration-300 hover:bg-white/[0.07]"
    >
      <div
        className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: member.c2 }}
      />
      <div
        className="relative flex h-20 w-20 items-center justify-center rounded-2xl font-display text-xl text-white ring-1 ring-white/15"
        style={{
          background: `linear-gradient(140deg, ${member.c1}, ${member.c2})`,
          boxShadow: `0 24px 60px -24px ${member.c2}aa`,
        }}
      >
        {member.initials}
      </div>
      <div className="relative mt-6 font-display text-lg text-white">{member.name}</div>
      <div className="relative mt-1 text-[10px] uppercase tracking-[0.28em] text-white/70">{member.role}</div>
      <p className="relative mt-4 text-sm leading-relaxed text-white/60">{member.bio}</p>
    </motion.div>
  );
}
