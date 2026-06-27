import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Stacks on requireSupabaseAuth, then asserts the user has the 'admin' role.
// Uses the admin client to call has_role (the RPC is locked down from public API).
export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await (supabaseAdmin as unknown as {
      rpc: (n: string, a: Record<string, unknown>) => Promise<{ data: boolean | null; error: unknown }>;
    }).rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error || !data) {
      throw new Error("Forbidden: admin role required");
    }
    return next();
  });
