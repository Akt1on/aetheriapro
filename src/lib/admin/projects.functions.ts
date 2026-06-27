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

const projectSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(160),
  year: z.string().min(1).max(20),
  task: z.string().min(1).max(800),
  solution: z.string().min(1).max(800),
  result: z.string().min(1).max(400),
  color_primary: z.string().min(4).max(20),
  color_accent: z.string().min(4).max(20),
  display_order: z.number().int().min(0).max(9999),
  published: z.boolean(),
});

export const listProjectsAdmin = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const supa = context.supabase as unknown as AnyDB;
    const { data, error } = await supa
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown[]) as any[];
  });

export const upsertProject = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().uuid().optional(), values: projectSchema }))
  .handler(async ({ data, context }) => {
    const supa = context.supabase as unknown as AnyDB;
    if (data.id) {
      const { error } = await supa.from("projects").update(data.values).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supa.from("projects").insert(data.values);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const supa = context.supabase as unknown as AnyDB;
    const { error } = await supa.from("projects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
