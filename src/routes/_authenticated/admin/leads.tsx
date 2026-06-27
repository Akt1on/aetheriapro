import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listLeads, updateLead, deleteLead } from "@/lib/admin/leads.functions";
import { useMemo, useState } from "react";
import { Trash2, Search, Mail, Building2, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/leads")({
  ssr: false,
  component: LeadsPage,
});

const STATUSES = [
  { id: "new", label: "Новые" },
  { id: "contacted", label: "В работе" },
  { id: "qualified", label: "Квалиф." },
  { id: "won", label: "Выиграно" },
  { id: "lost", label: "Проиграно" },
] as const;

type Status = (typeof STATUSES)[number]["id"];

function LeadsPage() {
  const listFn = useServerFn(listLeads);
  const updateFn = useServerFn(updateLead);
  const deleteFn = useServerFn(deleteLead);
  const qc = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin", "leads"],
    queryFn: () => listFn(),
  });

  const [filter, setFilter] = useState<Status | "all">("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return (leads as Array<Record<string, unknown>>).filter((l) => {
      if (filter !== "all" && l.status !== filter) return false;
      if (!q) return true;
      const hay = `${l.name ?? ""} ${l.email ?? ""} ${l.company ?? ""} ${l.project_type ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [leads, filter, q]);

  const update = useMutation({
    mutationFn: (vars: { id: string; status?: Status; notes?: string }) =>
      updateFn({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "leads"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Сохранено");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "leads"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Удалено");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const exportCsv = () => {
    const rows = filtered;
    const headers = ["created_at", "name", "email", "company", "project_type", "design_style", "scope", "estimated_price", "capabilities", "status"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.join(",")]
      .concat(rows.map((r) => headers.map((h) => esc(Array.isArray(r[h]) ? (r[h] as string[]).join("|") : r[h])).join(",")))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aetheria-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">CRM</div>
          <h1 className="font-display text-4xl text-white">Заявки</h1>
        </div>
        <button onClick={exportCsv} className="btn-ghost-line rounded-full px-5 py-2.5 text-xs">
          Экспорт CSV
        </button>
      </header>

      <div className="glass-strong flex flex-wrap items-center gap-2 rounded-2xl p-3">
        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по имени, email, компании…"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-violet"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            Все · {(leads as unknown[]).length}
          </FilterChip>
          {STATUSES.map((s) => (
            <FilterChip key={s.id} active={filter === s.id} onClick={() => setFilter(s.id)}>
              {s.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="glass-strong overflow-hidden rounded-2xl">
        {isLoading ? (
          <div className="p-10 text-center text-white/50">Загрузка…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-white/50">Заявок нет</div>
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((l) => {
              const isOpen = openId === l.id;
              const caps = (l.capabilities as string[]) ?? [];
              return (
                <li key={l.id as string}>
                  <button
                    onClick={() => setOpenId(isOpen ? null : (l.id as string))}
                    className="grid w-full grid-cols-12 items-center gap-3 px-5 py-4 text-left transition hover:bg-white/[0.03]"
                  >
                    <div className="col-span-12 sm:col-span-3">
                      <div className="text-sm text-white">{(l.name as string) || <span className="text-white/40">без имени</span>}</div>
                      <div className="text-xs text-white/50">{(l.email as string) || (l.company as string) || ""}</div>
                    </div>
                    <div className="col-span-6 text-xs text-white/60 sm:col-span-3">{l.project_type as string} · {l.scope as string}</div>
                    <div className="col-span-3 text-sm text-aurora sm:col-span-2">{(l.estimated_price as number).toLocaleString("ru-RU")} ₽</div>
                    <div className="col-span-3 sm:col-span-2">
                      <StatusBadge status={l.status as Status} />
                    </div>
                    <div className="col-span-12 text-[11px] text-white/40 sm:col-span-2 sm:text-right">
                      {new Date(l.created_at as string).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-white/5 bg-black/30 px-5 py-5">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-white/70"><Mail className="h-3.5 w-3.5" /> {(l.email as string) || "—"}</div>
                          <div className="flex items-center gap-2 text-white/70"><Building2 className="h-3.5 w-3.5" /> {(l.company as string) || "—"}</div>
                          <div className="flex items-center gap-2 text-white/70"><Calendar className="h-3.5 w-3.5" /> {new Date(l.created_at as string).toLocaleString("ru-RU")}</div>
                          <div className="text-xs text-white/50">Стиль: {l.design_style as string}</div>
                          {caps.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {caps.map((c) => (
                                <span key={c} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/70">{c}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40">Статус</div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {STATUSES.map((s) => (
                                <button
                                  key={s.id}
                                  onClick={() => update.mutate({ id: l.id as string, status: s.id })}
                                  className={`rounded-full border px-3 py-1 text-xs transition ${
                                    l.status === s.id
                                      ? "border-violet bg-violet/20 text-white"
                                      : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                                  }`}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40">Заметки</div>
                            <NotesEditor
                              initial={(l.notes as string) ?? ""}
                              onSave={(notes) => update.mutate({ id: l.id as string, notes })}
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                if (confirm("Удалить заявку?")) del.mutate(l.id as string);
                              }}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Удалить
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function NotesEditor({ initial, onSave }: { initial: string; onSave: (s: string) => void }) {
  const [v, setV] = useState(initial);
  return (
    <div className="mt-2 space-y-2">
      <textarea
        value={v}
        onChange={(e) => setV(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-violet"
        placeholder="Контекст, договорённости, следующий шаг…"
      />
      {v !== initial && (
        <button onClick={() => onSave(v)} className="btn-primary-glow rounded-full px-4 py-1.5 text-xs">
          Сохранить
        </button>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs transition ${
        active ? "bg-white/15 text-white" : "border border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string }> = {
    new: { label: "Новая", cls: "bg-cyan/15 text-cyan" },
    contacted: { label: "В работе", cls: "bg-violet/20 text-violet-200" },
    qualified: { label: "Квалиф.", cls: "bg-indigo-500/20 text-indigo-200" },
    won: { label: "Выиграно", cls: "bg-emerald-500/15 text-emerald-300" },
    lost: { label: "Проиграно", cls: "bg-rose-500/15 text-rose-300" },
  };
  const s = map[status];
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] ${s.cls}`}>{s.label}</span>;
}
