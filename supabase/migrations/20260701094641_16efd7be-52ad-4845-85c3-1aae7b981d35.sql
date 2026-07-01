-- Anonymous users can no longer insert leads directly through the Data API.
-- All submissions must go through /api/public/submit-lead which enforces
-- rate-limiting, honeypot checks, and validation, then writes via service_role.
DROP POLICY IF EXISTS "Anyone can create a lead" ON public.leads;
REVOKE INSERT ON public.leads FROM anon;
REVOKE INSERT ON public.leads FROM authenticated;
-- service_role still has ALL from the original migration (used by the server route).