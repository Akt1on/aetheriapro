/**
 * Public reads of services/projects via the browser supabase client.
 * Uses the publishable key and the "Public reads published…" RLS policies.
 */
import { supabase } from "@/integrations/supabase/client";

export type PublicService = {
  id: string;
  title: string;
  description: string;
  base_price: number;
  price_label: string | null;
  icon: string;
  display_order: number;
};

export type PublicProject = {
  id: string;
  name: string;
  category: string;
  year: string;
  task: string;
  solution: string;
  result: string;
  color_primary: string;
  color_accent: string;
  display_order: number;
};

export async function fetchServices(): Promise<PublicService[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("services")
    .select("id,title,description,base_price,price_label,icon,display_order")
    .eq("published", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicService[];
}

export async function fetchProjects(): Promise<PublicProject[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("projects")
    .select("id,name,category,year,task,solution,result,color_primary,color_accent,display_order")
    .eq("published", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicProject[];
}

const TRANSLIT: Record<string, string> = {
  а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const FALLBACK_PROJECTS: PublicProject[] = [
  { id: "p1", name: "Lumen Atelier", category: "Люкс-мода · E-commerce", year: "2026", task: "Перенести оффлайн-бутик в онлайн без потери ощущения ручной работы.", solution: "Каталог с мягкой 3D-витриной, тёплая типографика, чекаут в один экран.", result: "+38% к конверсии, средний чек вырос на 24%.", color_primary: "#1a1a1a", color_accent: "#c9a84c", display_order: 1 },
  { id: "p2", name: "Nova Aerospace", category: "Аэрокосмос · Корпоративный", year: "2026", task: "Объяснить сложный продукт инвесторам и инженерам.", solution: "Сценарный сторителлинг по скроллу, интерактивные схемы, EN/RU.", result: "Время на странице ×2.1, +47% к заявкам на демо.", color_primary: "#0a0a1a", color_accent: "#67e8f9", display_order: 2 },
  { id: "p3", name: "Hyperion AI", category: "SaaS · Веб-приложение", year: "2025", task: "Поднять активацию после регистрации.", solution: "Онбординг из 4 шагов, интерактивный дашборд.", result: "Активация с 31% до 58% за два месяца.", color_primary: "#16213e", color_accent: "#a78bfa", display_order: 3 },
];

type Loc = { category: string; task: string; solution: string; result: string };
const TR: Record<string, Partial<Record<"hy" | "en", Loc>>> = {
  "Lumen Atelier": {
    hy: { category: "Լյուքս նորաձևություն · E-commerce", task: "Օֆլայն բուտիկը տեղափոխել օնլայն՝ պահպանելով ձեռագործ աշխատանքի զգացողությունը։", solution: "Կատալոգ փափուկ 3D ցուցափեղկով, տաք տիպոգրաֆիկա, մեկ էկրանով վճարում։", result: "+38% կոնվերսիա, միջին չեկն աճել է 24%-ով։" },
    en: { category: "Luxury fashion · E-commerce", task: "Move an offline boutique online without losing the handcrafted feel.", solution: "Catalog with a soft 3D showcase, warm typography, one-screen checkout.", result: "+38% conversion, average order value up 24%." },
  },
  "Nova Aerospace": {
    hy: { category: "Ավիատիեզերք · Կորպորատիվ", task: "Բարդ արտադրանքը բացատրել ներդրողներին և ինժեներներին։", solution: "Սքրոլով պատմություն, ինտերակտիվ սխեմաներ, EN/RU։", result: "Էջում անցկացրած ժամանակը ×2.1, +47% դեմո հայտեր։" },
    en: { category: "Aerospace · Corporate", task: "Explain a complex product to investors and engineers.", solution: "Scroll-driven storytelling, interactive diagrams, EN/RU.", result: "Time on page ×2.1, +47% demo requests." },
  },
  "Hyperion AI": {
    hy: { category: "SaaS · Վեբ հավելված", task: "Բարձրացնել ակտիվացումը գրանցումից հետո։", solution: "4 քայլանի օնբորդինգ, ինտերակտիվ վահանակ։", result: "Ակտիվացումը 31%-ից 58% երկու ամսում։" },
    en: { category: "SaaS · Web app", task: "Increase activation after sign-up.", solution: "4-step onboarding, interactive dashboard.", result: "Activation from 31% to 58% in two months." },
  },
};
export function localizeProject(p: PublicProject, lang: "hy" | "ru" | "en"): PublicProject {
  if (lang === "ru") return p;
  const l = TR[p.name]?.[lang];
  return l ? { ...p, ...l } : p;
}
