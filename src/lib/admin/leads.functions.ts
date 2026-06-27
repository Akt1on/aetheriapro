import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./guard";

type AnyDB = {
  from: (t: string) => {
    select: (s: string, o?: { count?: "exact"; head?: boolean }) => any;
    update: (v: Record<string, unknown>) => any;
    delete: () => any;
    insert: (v: unknown) => any;
  };
};

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const supa = context.supabase as unknown as AnyDB;
    const { data, error } = await supa
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown[]) as any[];
  });

export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      status: z.enum(["new", "contacted", "qualified", "won", "lost"]).optional(),
      notes: z.string().max(4000).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const supa = context.supabase as unknown as AnyDB;
    const { error } = await supa.from("leads").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLead = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const supa = context.supabase as unknown as AnyDB;
    const { error } = await supa.from("leads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const leadStats = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const supa = context.supabase as unknown as AnyDB;
    const { data, error } = await supa
      .from("leads")
      .select("status, estimated_price, created_at");
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as Array<{ status: string; estimated_price: number; created_at: string }>;
    const total = rows.length;
    const byStatus: Record<string, number> = {};
    let pipeline = 0;
    let won = 0;
    rows.forEach((r) => {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      if (r.status !== "lost") pipeline += r.estimated_price || 0;
      if (r.status === "won") won += r.estimated_price || 0;
    });
    const last30 = rows.filter(
      (r) => Date.now() - new Date(r.created_at).getTime() < 1000 * 60 * 60 * 24 * 30,
    ).length;
    const avgCheck = total ? Math.round(rows.reduce((s, r) => s + (r.estimated_price || 0), 0) / total) : 0;
    return { total, byStatus, pipeline, won, last30, avgCheck };
  });
