import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Inbox, Briefcase, Wrench, LogOut, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  component: AdminShell,
});

function AdminShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!alive) return;
      setEmail(u.user?.email ?? "");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user?.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!alive) return;
      setIsAdmin(!error && !!data);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-white/60">
        Проверка доступа…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="glass-strong max-w-md rounded-3xl p-10 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-cyan" />
          <h1 className="mt-4 font-display text-3xl text-white">Доступ запрещён</h1>
          <p className="mt-3 text-sm text-white/60">
            Вы вошли как <span className="text-white">{email}</span>, но у этой учётной записи нет роли администратора.
          </p>
          <button onClick={signOut} className="btn-ghost-line mt-6 rounded-full px-6 py-2.5 text-sm">
            Выйти
          </button>
        </div>
      </div>
    );
  }

  const nav = [
    { to: "/admin", label: "Обзор", icon: LayoutDashboard, exact: true },
    { to: "/admin/leads", label: "Заявки", icon: Inbox },
    { to: "/admin/projects", label: "Проекты", icon: Briefcase },
    { to: "/admin/services", label: "Услуги", icon: Wrench },
  ] as const;

  return (
    <div className="dark relative min-h-screen bg-background text-white">
      <div className="fixed inset-0 -z-10 opacity-60"
        style={{ background: "radial-gradient(ellipse at top, oklch(0.18 0.06 268) 0%, oklch(0.06 0.02 265) 70%)" }} />
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 lg:px-8">
        <aside className="glass-strong sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col rounded-2xl p-4 lg:flex">
          <div className="px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Aetheria</div>
            <div className="font-display text-xl text-white">Админка</div>
          </div>
          <nav className="mt-6 flex flex-col gap-1">
            {nav.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-white/10 pt-4">
            <div className="px-3 text-xs text-white/40">{email}</div>
            <button onClick={signOut} className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white">
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {/* mobile top bar */}
          <div className="glass-strong mb-4 flex items-center justify-between rounded-2xl p-3 lg:hidden">
            <div className="flex gap-1 overflow-x-auto">
              {nav.map((n) => {
                const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
                return (
                  <Link key={n.to} to={n.to} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs ${active ? "bg-white/15 text-white" : "text-white/60"}`}>
                    {n.label}
                  </Link>
                );
              })}
            </div>
            <button onClick={signOut} className="rounded-lg p-2 text-white/60"><LogOut className="h-4 w-4" /></button>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
