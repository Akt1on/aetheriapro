import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const payloadSchema = z.object({
  name: z.string().max(200).optional().nullable(),
  email: z.string().max(200).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  project_type: z.string().max(80),
  design_style: z.string().max(80),
  capabilities: z.array(z.string().max(40)).max(20),
  scope: z.string().max(80),
  estimated_price: z.number().int().min(0).max(100_000_000),
});

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const Route = createFileRoute("/api/public/notify-lead")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
        const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
        if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY || !CHAT_ID) {
          return Response.json({ ok: false, skipped: true }, { status: 200 });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "bad json" }, { status: 400 });
        }
        const parsed = payloadSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid payload" }, { status: 400 });
        }
        const l = parsed.data;

        const price = l.estimated_price.toLocaleString("ru-RU");
        const caps = l.capabilities.length ? l.capabilities.join(", ") : "—";
        const contact = [l.name, l.email, l.company].filter(Boolean).join(" · ") || "без контактов";
        const text = [
          "<b>🚀 Новая заявка · Aetheria</b>",
          "",
          `<b>Бюджет:</b> ${price} ₽`,
          `<b>Тип:</b> ${escape(l.project_type)}`,
          `<b>Стиль:</b> ${escape(l.design_style)}`,
          `<b>Объём:</b> ${escape(l.scope)}`,
          `<b>Возможности:</b> ${escape(caps)}`,
          "",
          `<b>Контакт:</b> ${escape(contact)}`,
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
          if (!res.ok) {
            const detail = await res.text();
            console.error("[notify-lead] telegram fail", res.status, detail);
            return Response.json({ ok: false }, { status: 200 });
          }
        } catch (err) {
          console.error("[notify-lead] telegram error", err);
          return Response.json({ ok: false }, { status: 200 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
