export type Lang = "hy" | "ru" | "en";
export type Currency = "AMD" | "RUB" | "USD";
export const LANG_CURRENCY: Record<Lang, Currency> = { hy: "AMD", ru: "RUB", en: "USD" };

export const P_TYPES = [
  { id: "landing", base: 30000 },
  { id: "corp", base: 80000 },
  { id: "ecom", base: 150000 },
  { id: "saas", base: 250000 },
  { id: "exp", base: 200000 },
] as const;
export const P_STYLES = [
  { id: "void", colors: ["#05060f", "#4f46e5", "#a855f7", "#22d3ee"] },
  { id: "minimal", colors: ["#f4f2ee", "#111111", "#9a9a9a", "#e5e1d8"] },
  { id: "cyber", colors: ["#07070a", "#00ffa3", "#ff2bd6", "#2b6cff"] },
  { id: "boutique", colors: ["#1b1310", "#c9a84c", "#e8d8c0", "#7a3e2b"] },
] as const;
export const P_FEATURES = [
  { id: "3d", add: 40000 },
  { id: "multi", add: 15000 },
  { id: "auth", add: 35000 },
  { id: "pay", add: 25000 },
  { id: "crm", add: 15000 },
  { id: "cms", add: 20000 },
] as const;
export const P_TIMES = [
  { id: "fast", mult: 1.25 },
  { id: "std", mult: 1 },
  { id: "flag", mult: 1.3 },
] as const;

export type PortalSel = { type: string; style: string; features: string[]; time: string };

/** Price in RUB: (type base + features) × timeline multiplier. */
export function portalPriceRub(s: PortalSel): number {
  const base = P_TYPES.find((t) => t.id === s.type)?.base ?? 0;
  const add = s.features.reduce((a, f) => a + (P_FEATURES.find((x) => x.id === f)?.add ?? 0), 0);
  const mult = P_TIMES.find((t) => t.id === s.time)?.mult ?? 1;
  return Math.round((base + add) * mult);
}

/** Converts RUB to display currency, rounded: AMD to 1 000, USD to 10. */
export function convert(rub: number, c: Currency): number {
  if (c === "AMD") return Math.round((rub * 4.5) / 1000) * 1000;
  if (c === "USD") return Math.round(rub / 90 / 10) * 10;
  return rub;
}

export function formatMoney(rub: number, c: Currency): string {
  const v = convert(rub, c);
  if (c === "USD") return "$" + v.toLocaleString("en-US");
  if (c === "AMD") return v.toLocaleString("en-US") + " ֏";
  return v.toLocaleString("ru-RU") + " ₽";
}

type Dict = Record<string, string>;
export const T: Record<Lang, Dict> = {
  hy: {
    portfolio: "Մեր գործերը", back: "Հետ", next: "Առաջ", step: "Քայլ",
    s1_t: "Բարի գալուստ Aetheria", s1_s: "Ընտրեք լեզուն՝ նախագիծը սկսելու համար",
    s2_t: "Ի՞նչ նախագիծ ենք ստեղծում", s2_s: "Ընտրեք կայքի ձևաչափը",
    landing: "Պրեմիում լենդինգ", landing_d: "Մեկ էջ, բարձր կոնվերսիա",
    corp: "Կորպորատիվ կայք", corp_d: "Բազմաէջ բրենդային հարթակ",
    ecom: "Ինտերնետ խանութ", ecom_d: "Կատալոգ, զամբյուղ, վճարումներ",
    saas: "Վեբ հավելված", saas_d: "Անձնական կաբինետ, բարդ տրամաբանություն",
    exp: "3D փորձառություն", exp_d: "Ինտերակտիվ WebGL շոուքեյս",
    s3_t: "Ինչպիսի՞ ոճ", s3_s: "Ընտրեք վիզուալ մթնոլորտը",
    void: "Void Luxe & 3D", void_d: "Տիեզերական սև, նեոնային փայլ",
    minimal: "Շվեյցարական մինիմալիզմ", minimal_d: "Մաքուր տիպոգրաֆիկա, շատ օդ",
    cyber: "Cyber & Interactive", cyber_d: "Դինամիկա, ձայներ, անիմացիա",
    boutique: "Warm Editorial", boutique_d: "Տաք երանգներ, հանգիստ լյուքս",
    s4_t: "Ի՞նչ ֆունկցիոնալ է պետք", s4_s: "Ընտրեք մի քանիսը",
    f_3d: "3D գրաֆիկա", f_multi: "Բազմալեզվություն", f_auth: "Անձնական կաբինետ",
    f_pay: "Օնլայն վճարումներ", f_crm: "Telegram և CRM", f_cms: "Ադմին վահանակ",
    s5_t: "Ժամկետներ", s5_s: "Երբ՞ պետք է գործարկել",
    fast: "Էքսպրես", fast_d: "10–14 օր", std: "Ստանդարտ", std_d: "3–4 շաբաթ", flag: "Ֆլագման", flag_d: "6–8 շաբաթ",
    s6_t: "Ձեր նախագիծը պատրաստ է", s6_s: "Թողեք կոնտակտները — կպատասխանենք 15 րոպեում",
    est: "Մոտավոր արժեք", name: "Անուն", phone: "Հեռախոս / Telegram", email: "Էլ. փոստ",
    pdf: "Նախահաշիվ PDF", submit: "Ուղարկել հայտը", sending: "Ուղարկվում է…",
    ok_t: "Շնորհակալություն!", ok_s: "Մենք շուտով կկապվենք Ձեզ հետ։", again: "Նոր նախագիծ",
    err: "Ստուգեք էլ. փոստը", err_contact: "Նշեք հեռախոս/Telegram կամ ճիշտ էլ. փոստ", close: "Փակել", task: "Խնդիր", result: "Արդյունք", open: "Դիտել կեյսը",
  },
  ru: {
    portfolio: "Наши работы", back: "Назад", next: "Далее", step: "Шаг",
    s1_t: "Добро пожаловать в Aetheria", s1_s: "Выберите язык, чтобы начать проект",
    s2_t: "Какой проект создаём?", s2_s: "Выберите формат сайта",
    landing: "Премиум-лендинг", landing_d: "Одна страница, высокая конверсия",
    corp: "Корпоративный сайт", corp_d: "Многостраничная бренд-платформа",
    ecom: "Интернет-магазин", ecom_d: "Каталог, корзина, оплата",
    saas: "Веб-сервис", saas_d: "Личный кабинет, сложная логика",
    exp: "3D-экспириенс", exp_d: "Интерактивная WebGL-витрина",
    s3_t: "Какой стиль?", s3_s: "Выберите визуальную атмосферу",
    void: "Void Luxe & 3D", void_d: "Глубокий космос, неоновое сияние",
    minimal: "Швейцарский минимализм", minimal_d: "Чистая типографика, воздух",
    cyber: "Cyber & Interactive", cyber_d: "Динамика, звуки, анимации",
    boutique: "Warm Editorial", boutique_d: "Тёплый глянец, спокойный люкс",
    s4_t: "Какой функционал нужен?", s4_s: "Можно выбрать несколько",
    f_3d: "3D-графика", f_multi: "Мультиязычность", f_auth: "Личный кабинет",
    f_pay: "Онлайн-оплата", f_crm: "Telegram и CRM", f_cms: "Админ-панель",
    s5_t: "Сроки запуска", s5_s: "Когда нужен сайт?",
    fast: "Экспресс", fast_d: "10–14 дней", std: "Стандарт", std_d: "3–4 недели", flag: "Флагман", flag_d: "6–8 недель",
    s6_t: "Ваш проект готов", s6_s: "Оставьте контакты — ответим за 15 минут",
    est: "Ориентировочная стоимость", name: "Имя", phone: "Телефон / Telegram", email: "Email",
    pdf: "Смета PDF", submit: "Отправить заявку", sending: "Отправляем…",
    ok_t: "Спасибо!", ok_s: "Мы скоро свяжемся с вами.", again: "Новый проект",
    err: "Проверьте email", err_contact: "Укажите телефон/Telegram или корректный email", close: "Закрыть", task: "Задача", result: "Результат", open: "Смотреть кейс",
  },
  en: {
    portfolio: "Our work", back: "Back", next: "Continue", step: "Step",
    s1_t: "Welcome to Aetheria", s1_s: "Choose your language to start a project",
    s2_t: "What are we building?", s2_s: "Choose the website format",
    landing: "Premium landing", landing_d: "One page, high conversion",
    corp: "Corporate website", corp_d: "Multi-page brand platform",
    ecom: "Online store", ecom_d: "Catalog, cart, payments",
    saas: "Web app", saas_d: "Dashboards, complex logic",
    exp: "3D experience", exp_d: "Interactive WebGL showcase",
    s3_t: "Which style?", s3_s: "Choose the visual mood",
    void: "Void Luxe & 3D", void_d: "Deep space, neon glow",
    minimal: "Swiss minimal", minimal_d: "Pure typography, whitespace",
    cyber: "Cyber & Interactive", cyber_d: "Motion, sound, energy",
    boutique: "Warm Editorial", boutique_d: "Warm tones, quiet luxury",
    s4_t: "Which features?", s4_s: "Pick as many as you need",
    f_3d: "3D graphics", f_multi: "Multi-language", f_auth: "User accounts",
    f_pay: "Online payments", f_crm: "Telegram & CRM", f_cms: "Admin panel",
    s5_t: "Timeline", s5_s: "When do you need to launch?",
    fast: "Express", fast_d: "10–14 days", std: "Standard", std_d: "3–4 weeks", flag: "Flagship", flag_d: "6–8 weeks",
    s6_t: "Your project is ready", s6_s: "Leave your contacts — we reply within 15 minutes",
    est: "Estimated investment", name: "Name", phone: "Phone / Telegram", email: "Email",
    pdf: "Estimate PDF", submit: "Send request", sending: "Sending…",
    ok_t: "Thank you!", ok_s: "We will contact you shortly.", again: "New project",
    err: "Check your email", err_contact: "Enter a phone/Telegram or a valid email", close: "Close", task: "Task", result: "Result", open: "View case",
  },
};
