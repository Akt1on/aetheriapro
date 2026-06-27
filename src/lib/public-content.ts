/**
 * Public reads of services/projects via the browser supabase client.
 * Uses the publishable key and the "Public reads published…" RLS policies.
 */
import { supabase } from "@/integrations/supabase/client";

export type PublicService = {
  id: string;
  title: string;
  description: string;
  base_price: number;
  price_label: string | null;
  icon: string;
  display_order: number;
};

export type PublicProject = {
  id: string;
  name: string;
  category: string;
  year: string;
  task: string;
  solution: string;
  result: string;
  color_primary: string;
  color_accent: string;
  display_order: number;
};

export async function fetchServices(): Promise<PublicService[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("services")
    .select("id,title,description,base_price,price_label,icon,display_order")
    .eq("published", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicService[];
}

export async function fetchProjects(): Promise<PublicProject[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("projects")
    .select("id,name,category,year,task,solution,result,color_primary,color_accent,display_order")
    .eq("published", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as PublicProject[];
}
