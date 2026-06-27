import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./guard";

type AnyDB = {
  from: (t: string) => {
    select: (s: string) => any;
    update: (v: Record<string, unknown>) => any;
    delete: () => any;
    insert: (v: unknown) => any;
  };
};

const serviceSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(600),
  base_price: z.number().int().min(0),
  price_label: z.string().max(60).nullable().optional(),
  icon: z.string().min(1).max(40),
  display_order: z.number().int().min(0).max(9999),
  published: z.boolean(),
});

export const listServicesAdmin = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const supa = context.supabase as unknown as AnyDB;
    const { data, error } = await supa
      .from("services")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown[]) as any[];
  });

export const upsertService = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().uuid().optional(), values: serviceSchema }))
  .handler(async ({ data, context }) => {
    const supa = context.supabase as unknown as AnyDB;
    if (data.id) {
      const { error } = await supa.from("services").update(data.values).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supa.from("services").insert(data.values);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteService = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const supa = context.supabase as unknown as AnyDB;
    const { error } = await supa.from("services").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
