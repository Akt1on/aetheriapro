import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listProjectsAdmin, upsertProject, deleteProject } from "@/lib/admin/projects.functions";
import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/projects")({
  ssr: false,
  component: ProjectsPage,
});

type ProjectForm = {
  name: string;
  category: string;
  year: string;
  task: string;
  solution: string;
  result: string;
  color_primary: string;
  color_accent: string;
  display_order: number;
  published: boolean;
};

const empty: ProjectForm = {
  name: "",
  category: "",
  year: String(new Date().getFullYear()),
  task: "",
  solution: "",
  result: "",
  color_primary: "#0a0a1a",
  color_accent: "#a855f7",
  display_order: 100,
  published: true,
};

function ProjectsPage() {
  const listFn = useServerFn(listProjectsAdmin);
  const saveFn = useServerFn(upsertProject);
  const delFn = useServerFn(deleteProject);
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "projects"],
    queryFn: () => listFn(),
  });

  const [editing, setEditing] = useState<(ProjectForm & { id?: string }) | null>(null);

  const save = useMutation({
    mutationFn: (vars: { id?: string; values: ProjectForm }) => saveFn({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      qc.invalidateQueries({ queryKey: ["public", "projects"] });
      toast.success("Проект сохранён");
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      qc.invalidateQueries({ queryKey: ["public", "projects"] });
      toast.success("Удалено");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Портфолио</div>
          <h1 className="font-display text-4xl text-white">Проекты</h1>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary-glow inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {isLoading ? <div className="text-white/50">Загрузка…</div> : (items as any[]).map((p) => (
          <div key={p.id} className="glass-strong rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-white/50">{p.category} · {p.year}</div>
                <div className="font-display text-xl text-white">{p.name}</div>
              </div>
              <div className="flex gap-1">
                {!p.published && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-300">Скрыт</span>}
              </div>
            </div>
            <p className="mt-2 text-sm text-white/60">{p.result}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-5 w-5 rounded ring-1 ring-white/20" style={{ background: p.color_primary }} />
              <span className="h-5 w-5 rounded ring-1 ring-white/20" style={{ background: p.color_accent }} />
              <span className="ml-auto text-[10px] text-white/40">order: {p.display_order}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setEditing({ ...(p as ProjectForm), id: p.id })} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5">
                Редактировать
              </button>
              <button
                onClick={() => save.mutate({ id: p.id, values: { ...p, published: !p.published } })}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
              >
                {p.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {p.published ? "Скрыть" : "Показать"}
              </button>
              <button
                onClick={() => { if (confirm("Удалить?")) del.mutate(p.id); }}
                className="ml-auto inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <Editor
          value={editing}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={(v) => save.mutate({ id: editing.id, values: v })}
          saving={save.isPending}
        />
      )}
    </div>
  );
}

function Editor({
  value, onChange, onClose, onSave, saving,
}: {
  value: ProjectForm & { id?: string };
  onChange: (v: ProjectForm & { id?: string }) => void;
  onClose: () => void;
  onSave: (v: ProjectForm) => void;
  saving: boolean;
}) {
  const set = <K extends keyof ProjectForm>(k: K, v: ProjectForm[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl">
      <div className="glass-strong max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-white">{value.id ? "Редактировать" : "Новый проект"}</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">✕</button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Field label="Название"><input value={value.name} onChange={(e) => set("name", e.target.value)} className="inp" /></Field>
          <Field label="Категория"><input value={value.category} onChange={(e) => set("category", e.target.value)} className="inp" /></Field>
          <Field label="Год"><input value={value.year} onChange={(e) => set("year", e.target.value)} className="inp" /></Field>
          <Field label="Порядок"><input type="number" value={value.display_order} onChange={(e) => set("display_order", Number(e.target.value))} className="inp" /></Field>
          <Field label="Задача" full><textarea value={value.task} onChange={(e) => set("task", e.target.value)} className="inp" rows={2} /></Field>
          <Field label="Решение" full><textarea value={value.solution} onChange={(e) => set("solution", e.target.value)} className="inp" rows={2} /></Field>
          <Field label="Результат" full><textarea value={value.result} onChange={(e) => set("result", e.target.value)} className="inp" rows={2} /></Field>
          <Field label="Цвет primary"><input type="color" value={value.color_primary} onChange={(e) => set("color_primary", e.target.value)} className="h-10 w-full rounded-lg bg-transparent" /></Field>
          <Field label="Цвет accent"><input type="color" value={value.color_accent} onChange={(e) => set("color_accent", e.target.value)} className="h-10 w-full rounded-lg bg-transparent" /></Field>
          <label className="flex items-center gap-2 text-sm text-white/70 sm:col-span-2">
            <input type="checkbox" checked={value.published} onChange={(e) => set("published", e.target.checked)} />
            Опубликован на сайте
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost-line rounded-full px-5 py-2.5 text-xs">Отмена</button>
          <button disabled={saving} onClick={() => onSave(value)} className="btn-primary-glow rounded-full px-5 py-2.5 text-xs disabled:opacity-50">
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>
      <style>{`.inp{width:100%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);border-radius:.5rem;padding:.5rem .75rem;color:#fff;font-size:.85rem;outline:none}.inp:focus{border-color:#a855f7}`}</style>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block text-xs text-white/60 ${full ? "sm:col-span-2" : ""}`}>
      <div className="mb-1">{label}</div>
      {children}
    </label>
  );
}
