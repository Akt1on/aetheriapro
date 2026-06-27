/**
 * Submits a configurator lead via the browser supabase client.
 * RLS allows anon INSERT; reads remain admin-only.
 */
import { supabase } from "@/integrations/supabase/client";

export type LeadPayload = {
  name?: string | null;
  email?: string | null;
  company?: string | null;
  project_type: string;
  design_style: string;
  capabilities: string[];
  scope: string;
  estimated_price: number;
};

export async function submitLead(payload: LeadPayload) {
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 400) : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("leads") as any).insert({
    ...payload,
    user_agent: userAgent,
    source: "configurator",
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}
