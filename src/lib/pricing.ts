export type Selections = {
  type: string;
  style: string;
  capabilities: string[];
  scope: string;
};

export const TYPES = [
  { id: "landing", label: "Премиум-лендинг", desc: "Одна страница. Кинематографичная.", base: 30000 },
  { id: "corp", label: "Корпоративный сайт", desc: "Многостраничный бренд-опыт.", base: 80000 },
  { id: "ecom", label: "E-commerce с 3D", desc: "Иммерсивные витрины товаров.", base: 150000 },
  { id: "app", label: "Веб-приложение", desc: "Кастомный продукт, PWA.", base: 250000 },
] as const;

export const STYLES = [
  { id: "void", label: "Тёмная роскошь", colors: ["#0a0a1a", "#4f46e5", "#a855f7", "#22d3ee"] },
  { id: "editorial", label: "Редакционный", colors: ["#f5f3ee", "#0d0d0d", "#c9a84c", "#6b3a2a"] },
  { id: "neo", label: "Нео-брутализм", colors: ["#ffffff", "#0a0a0a", "#ff5722", "#ffeb3b"] },
  { id: "glass", label: "Стеклянное сияние", colors: ["#1a1a2e", "#4ade80", "#a78bfa", "#67e8f9"] },
] as const;

export const CAPS = [
  { id: "3d", label: "Real-time 3D / WebGL", add: 40000 },
  { id: "ai", label: "AI-интерфейсы", add: 35000 },
  { id: "cms", label: "Headless CMS", add: 20000 },
  { id: "anim", label: "Кинематографичная анимация", add: 25000 },
  { id: "i18n", label: "Мультиязычность", add: 15000 },
  { id: "perf", label: "Edge-производительность", add: 18000 },
] as const;

export const SCOPES = [
  { id: "sprint", label: "Спринт · 4 недели", mult: 1.15 },
  { id: "standard", label: "Стандарт · 8 недель", mult: 1.0 },
  { id: "premium", label: "Премиум · 12 недель", mult: 1.25 },
] as const;

/** Итоговая смета: (база типа + опции) × коэффициент сроков, округлённая до рубля. */
export function calcPrice(sel: Selections): number {
  const base = TYPES.find((t) => t.id === sel.type)?.base ?? 0;
  const caps = sel.capabilities.reduce(
    (sum, c) => sum + (CAPS.find((x) => x.id === c)?.add ?? 0),
    0,
  );
  const mult = SCOPES.find((s) => s.id === sel.scope)?.mult ?? 1;
  return Math.round((base + caps) * mult);
}
