/**
 * Sends a configurator lead through the server route (/api/public/submit-lead).
 * The server route enforces rate-limiting, honeypot checks, validation,
 * writes via service_role, and fires a Telegram notification.
 */
export type LeadPayload = {
  name?: string | null;
  email?: string | null;
  company?: string | null;
  project_type: string;
  design_style: string;
  capabilities: string[];
  scope: string;
  estimated_price: number;
  /** Honeypot — must always be empty from real users. */
  website?: string | null;
};

export async function submitLead(payload: LeadPayload) {
  const res = await fetch("/api/public/submit-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !body.ok) {
    throw new Error(body.error ?? "Не удалось отправить заявку");
  }
  return { ok: true };
}
