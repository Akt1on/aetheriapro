import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { leadStats } from "@/lib/admin/leads.functions";
import { TrendingUp, Inbox, Trophy, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  ssr: false,
  component: Dashboard,
});

const ru = (n: number) => n.toLocaleString("ru-RU");

function Dashboard() {
  const fn = useServerFn(leadStats);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => fn(),
    refetchInterval: 30_000,
  });

  const cards = [
    { label: "Всего заявок", value: data?.total ?? 0, icon: Inbox, color: "text-cyan" },
    { label: "За 30 дней", value: data?.last30 ?? 0, icon: TrendingUp, color: "text-cyan" },
    { label: "Пайплайн, ₽", value: ru(data?.pipeline ?? 0), icon: Wallet, color: "text-aurora" },
    { label: "Выиграно, ₽", value: ru(data?.won ?? 0), icon: Trophy, color: "text-gold" },
  ];

  const statusLabels: Record<string, string> = {
    new: "Новые",
    contacted: "В работе",
    qualified: "Квалиф.",
    won: "Выиграно",
    lost: "Проиграно",
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Дашборд</div>
        <h1 className="font-display text-4xl text-white">Обзор студии</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="glass-strong rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-widest text-white/40">{c.label}</div>
                <Icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <div className="mt-3 font-display text-3xl text-white">
                {isLoading ? "—" : c.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-strong rounded-2xl p-6">
        <div className="text-xs uppercase tracking-widest text-white/40">Воронка</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          {(["new", "contacted", "qualified", "won", "lost"] as const).map((s) => (
            <div key={s} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs text-white/50">{statusLabels[s]}</div>
              <div className="mt-2 font-display text-2xl text-white">{data?.byStatus?.[s] ?? 0}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-strong rounded-2xl p-6">
        <div className="text-xs uppercase tracking-widest text-white/40">Средний бюджет</div>
        <div className="mt-2 font-display text-3xl text-aurora">{isLoading ? "—" : `${ru(data?.avgCheck ?? 0)} ₽`}</div>
        <p className="mt-3 text-sm text-white/55">
          Считается по всем заявкам, попавшим в систему. Используйте раздел «Заявки» для перевода лидов по этапам.
        </p>
      </div>
    </div>
  );
}
