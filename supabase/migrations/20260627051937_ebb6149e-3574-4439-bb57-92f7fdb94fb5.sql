
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Bootstrap: first user becomes admin
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_bootstrap_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_admin();

-- ============ LEADS ============
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'won', 'lost');

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  company text,
  project_type text NOT NULL,
  design_style text NOT NULL,
  capabilities text[] NOT NULL DEFAULT '{}',
  scope text NOT NULL,
  estimated_price integer NOT NULL,
  status public.lead_status NOT NULL DEFAULT 'new',
  notes text,
  source text DEFAULT 'configurator',
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.leads TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a lead; only admins can read/modify
CREATE POLICY "Anyone can create a lead" ON public.leads
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read leads" ON public.leads
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update leads" ON public.leads
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete leads" ON public.leads
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ PROJECTS (portfolio) ============
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  year text NOT NULL,
  task text NOT NULL,
  solution text NOT NULL,
  result text NOT NULL,
  color_primary text NOT NULL DEFAULT '#0a0a1a',
  color_accent text NOT NULL DEFAULT '#a855f7',
  display_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published projects" ON public.projects
  FOR SELECT TO anon, authenticated USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage projects" ON public.projects
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SERVICES ============
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  base_price integer NOT NULL,
  price_label text,
  icon text NOT NULL DEFAULT 'Sparkles',
  display_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published services" ON public.services
  FOR SELECT TO anon, authenticated USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage services" ON public.services
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER leads_touch_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER projects_touch_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER services_touch_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ Seed services + projects ============
INSERT INTO public.services (title, description, base_price, price_label, icon, display_order) VALUES
('Премиум-лендинги', 'Кинематографичные одностраничники, созданные вдохновлять и конвертировать.', 30000, 'от 30 000 ₽', 'Sparkles', 1),
('Корпоративные сайты', 'Многостраничные бренд-системы с редакционным вниманием к деталям.', 80000, 'от 80 000 ₽', 'Globe', 2),
('E-commerce с 3D', 'Миры товаров, через которые можно пройти. Витрины, рассказывающие истории.', 150000, 'от 150 000 ₽', 'ShoppingBag', 3),
('PWA и веб-приложения', 'Производительные, устанавливаемые продукты, которые ощущаются как нативные.', 250000, 'от 250 000 ₽', 'Cpu', 4),
('Иммерсивные продукты', 'WebGL, AI, генеративное — уникальные моменты, которые умеем только мы.', 0, 'по запросу', 'Boxes', 5);

INSERT INTO public.projects (name, category, year, task, solution, result, color_primary, color_accent, display_order) VALUES
('Lumen Atelier', 'Люкс-мода · E-commerce', '2026', 'Перенести оффлайн-бутик в онлайн без потери ощущения ручной работы.', 'Каталог с мягкой 3D-витриной, тёплая типографика, чекаут в один экран.', '+38% к конверсии, средний чек вырос на 24%.', '#1a1a1a', '#c9a84c', 1),
('Nova Aerospace', 'Аэрокосмос · Корпоративный', '2026', 'Объяснить сложный продукт инвесторам и инженерам одновременно.', 'Сценарный сторителлинг по скроллу, интерактивные схемы, EN/RU.', 'Время на странице ×2.1, +47% к заявкам на демо.', '#0a0a1a', '#67e8f9', 2),
('Hyperion AI', 'SaaS · Веб-приложение', '2025', 'Поднять активацию после регистрации в B2B SaaS.', 'Новый онбординг из 4 шагов, интерактивный дашборд, тёмная тема.', 'Активация выросла с 31% до 58% за два месяца.', '#16213e', '#a78bfa', 3),
('Atelier Verde', 'Ресторан · Лендинг', '2025', 'Увеличить онлайн-бронирования и снизить нагрузку на хостес.', 'Лендинг-меню с атмосферой места, бронь в 2 тапа, интеграция с iiko.', '+62% онлайн-броней, звонки сократились на треть.', '#1a3c2a', '#a0c49d', 4),
('Forma Studio', 'Архитектура · Портфолио', '2025', 'Сделать портфолио, которое продаёт проекты от 30 млн ₽.', 'Кейсы-длинноформы, кинематографичные обложки, медленный ритм.', '5 крупных контрактов за квартал, средний бюджет +40%.', '#2d2d2d', '#e85d3a', 5),
('Polaris Bank', 'Финтех · PWA', '2024', 'Заменить мобильный сайт без жертв по скорости и доступности.', 'PWA на edge, офлайн-режим, аудит a11y по WCAG 2.2 AA.', 'Lighthouse 98+, отказы на мобильных −29%.', '#0f1b3d', '#3b6fa0', 6);

CREATE INDEX leads_status_idx ON public.leads(status, created_at DESC);
CREATE INDEX projects_order_idx ON public.projects(display_order);
CREATE INDEX services_order_idx ON public.services(display_order);
