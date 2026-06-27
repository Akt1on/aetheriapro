import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listServicesAdmin, upsertService, deleteService } from "@/lib/admin/services.functions";
import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/services")({
  ssr: false,
  component: ServicesPage,
});

type Form = {
  title: string;
  description: string;
  base_price: number;
  price_label: string;
  icon: string;
  display_order: number;
  published: boolean;
};

const empty: Form = {
  title: "",
  description: "",
  base_price: 50000,
  price_label: "от 50 000 ₽",
  icon: "Sparkles",
  display_order: 100,
  published: true,
};

const ICONS = ["Sparkles", "Globe", "ShoppingBag", "Cpu", "Boxes", "Code2", "Zap", "Layers"];

function ServicesPage() {
  const listFn = useServerFn(listServicesAdmin);
  const saveFn = useServerFn(upsertService);
  const delFn = useServerFn(deleteService);
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: () => listFn(),
  });

  const [editing, setEditing] = useState<(Form & { id?: string }) | null>(null);

  const save = useMutation({
    mutationFn: (vars: { id?: string; values: Form }) => saveFn({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "services"] });
      qc.invalidateQueries({ queryKey: ["public", "services"] });
      toast.success("Сохранено");
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "services"] });
      qc.invalidateQueries({ queryKey: ["public", "services"] });
      toast.success("Удалено");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Контент</div>
          <h1 className="font-display text-4xl text-white">Услуги</h1>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="btn-primary-glow inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? <div className="text-white/50">Загрузка…</div> : (items as any[]).map((s) => (
          <div key={s.id} className="glass-strong rounded-2xl p-5">
            <div className="text-xs text-white/40">{s.icon}</div>
            <div className="mt-1 font-display text-xl text-white">{s.title}</div>
            <p className="mt-2 text-sm text-white/55">{s.description}</p>
            <div className="mt-3 text-xs uppercase tracking-widest text-gold">{s.price_label || `${s.base_price.toLocaleString("ru-RU")} ₽`}</div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setEditing({ ...(s as Form), id: s.id })} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5">
                Редактировать
              </button>
              <button
                onClick={() => save.mutate({ id: s.id, values: { ...s, published: !s.published } })}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
              >
                {s.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => { if (confirm("Удалить?")) del.mutate(s.id); }}
                className="ml-auto inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl">
          <div className="glass-strong w-full max-w-xl rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-white">{editing.id ? "Редактировать" : "Новая услуга"}</h2>
              <button onClick={() => setEditing(null)} className="text-white/50">✕</button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Lbl label="Название" full><input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="inp" /></Lbl>
              <Lbl label="Описание" full><textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="inp" /></Lbl>
              <Lbl label="Базовая цена, ₽"><input type="number" value={editing.base_price} onChange={(e) => setEditing({ ...editing, base_price: Number(e.target.value) })} className="inp" /></Lbl>
              <Lbl label="Подпись цены"><input value={editing.price_label} onChange={(e) => setEditing({ ...editing, price_label: e.target.value })} className="inp" placeholder="от 50 000 ₽" /></Lbl>
              <Lbl label="Иконка">
                <select value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="inp">
                  {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </Lbl>
              <Lbl label="Порядок"><input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} className="inp" /></Lbl>
              <label className="flex items-center gap-2 text-sm text-white/70 sm:col-span-2">
                <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                Опубликовано
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="btn-ghost-line rounded-full px-5 py-2.5 text-xs">Отмена</button>
              <button onClick={() => save.mutate({ id: editing.id, values: editing })} className="btn-primary-glow rounded-full px-5 py-2.5 text-xs">Сохранить</button>
            </div>
            <style>{`.inp{width:100%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);border-radius:.5rem;padding:.5rem .75rem;color:#fff;font-size:.85rem;outline:none}.inp:focus{border-color:#a855f7}`}</style>
          </div>
        </div>
      )}
    </div>
  );
}

function Lbl({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block text-xs text-white/60 ${full ? "sm:col-span-2" : ""}`}>
      <div className="mb-1">{label}</div>{children}
    </label>
  );
}
