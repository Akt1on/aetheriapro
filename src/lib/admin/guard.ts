import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Ensures the caller is signed in AND has the 'admin' role.
// Stacks on top of requireSupabaseAuth, then queries has_role via SECURITY DEFINER.
export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error || !data) {
      throw new Error("Forbidden: admin role required");
    }
    return next();
  });
