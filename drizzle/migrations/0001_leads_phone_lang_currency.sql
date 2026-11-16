ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'RUB',
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'ru';
CREATE INDEX IF NOT EXISTS idx_leads_created_lang ON public.leads(created_at DESC, language);