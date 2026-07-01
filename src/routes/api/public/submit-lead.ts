import { createFileRoute } from "@tanstack/react-router";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

const payloadSchema = z.object({
  name: z.string().trim().max(200).optional().nullable(),
  email: z.string().trim().max(200).optional().nullable(),
  company: z.string().trim().max(200).optional().nullable(),
  project_type: z.string().min(1).max(80),
  design_style: z.string().min(1).max(80),
  capabilities: z.array(z.string().max(40)).max(20),
  scope: z.string().min(1).max(80),
  estimated_price: z.number().int().min(0).max(100_000_000),
  // Honeypot — real users leave it empty. Bots fill every input.
  website: z.string().max(500).optional().nullable(),
});

// Per-worker in-memory rate limit. Ephemeral (workers restart), but combined
// with the honeypot it stops the vast majority of automated abuse without a
// third-party service. Buckets: 5 submits / IP / 10 min, 30 submits / IP / hour.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
function bump(key: string, windowMs: number, limit: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  if (b.count > limit) return false;
  return true;
}
// Occasional GC so the map does not grow unbounded.
function sweep() {
  if (buckets.size < 500) return;
  const now = Date.now();
  for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function notifyTelegram(l: z.infer<typeof payloadSchema>) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
  const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY || !CHAT_ID) return;

  const price = l.estimated_price.toLocaleString("ru-RU");
  const caps = l.capabilities.length ? l.capabilities.join(", ") : "—";
  const contact = [l.name, l.email, l.company].filter(Boolean).join(" · ") || "без контактов";
  const text = [
    "<b>🚀 Новая заявка · Aetheria</b>",
    "",
    `<b>Бюджет:</b> ${price} ₽`,
    `<b>Тип:</b> ${escapeHtml(l.project_type)}`,
    `<b>Стиль:</b> ${escapeHtml(l.design_style)}`,
    `<b>Объём:</b> ${escapeHtml(l.scope)}`,
    `<b>Возможности:</b> ${escapeHtml(caps)}`,
    "",
    `<b>Контакт:</b> ${escapeHtml(contact)}`,
  ].join("\n");

  try {
    const res = await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) console.error("[submit-lead] telegram fail", res.status, await res.text());
  } catch (err) {
    console.error("[submit-lead] telegram error", err);
  }
}

export const Route = createFileRoute("/api/public/submit-lead")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        sweep();

        const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
        if (!bump(`m:${ip}`, 10 * 60_000, 5) || !bump(`h:${ip}`, 60 * 60_000, 30)) {
          return Response.json(
            { ok: false, error: "Слишком много заявок. Попробуйте позже." },
            { status: 429 },
          );
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ ok: false, error: "bad json" }, { status: 400 });
        }
        const parsed = payloadSchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Проверьте поля формы" }, { status: 400 });
        }
        const data = parsed.data;

        // Honeypot tripped — bot. Respond OK so the attacker learns nothing.
        if (data.website && data.website.trim().length > 0) {
          return Response.json({ ok: true });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 400);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabaseAdmin.from("leads") as any).insert({
          name: data.name ?? null,
          email: data.email ?? null,
          company: data.company ?? null,
          project_type: data.project_type,
          design_style: data.design_style,
          capabilities: data.capabilities,
          scope: data.scope,
          estimated_price: data.estimated_price,
          user_agent: userAgent,
          source: "configurator",
        });
        if (error) {
          console.error("[submit-lead] insert failed", error);
          return Response.json({ ok: false, error: "Не удалось сохранить" }, { status: 500 });
        }

        // Fire-and-forget: Telegram is best-effort.
        void notifyTelegram(data);
        return Response.json({ ok: true });
      },
    },
  },
});
