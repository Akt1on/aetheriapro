import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, LogIn } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Пароль должен быть не короче 8 символов");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Добро пожаловать");
        navigate({ to: "/admin", replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Аккаунт создан. Если включено подтверждение email — проверьте почту.");
        setMode("signin");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dark relative flex min-h-screen items-center justify-center bg-background p-4 text-white">
      <div className="fixed inset-0 -z-10 opacity-70"
        style={{ background: "radial-gradient(ellipse at center, oklch(0.2 0.08 270) 0%, oklch(0.06 0.02 265) 70%)" }} />

      <form onSubmit={submit} className="glass-strong relative w-full max-w-md rounded-3xl p-8">
        <div className="aurora-bg opacity-40" />
        <div className="relative">
          <div className="flex items-center gap-2 text-cyan">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-[0.3em]">Aetheria · Админка</span>
          </div>
          <h1 className="mt-3 font-display text-3xl">{mode === "signin" ? "Вход" : "Создать аккаунт"}</h1>
          <p className="mt-2 text-sm text-white/55">
            {mode === "signin"
              ? "Закрытая зона. Только для команды студии."
              : "Первый созданный аккаунт становится администратором."}
          </p>

          <div className="mt-6 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-violet"
            />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль (минимум 8 символов)"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-violet"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="btn-primary-glow mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {busy ? "…" : mode === "signin" ? "Войти" : "Создать аккаунт"}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-center text-xs text-white/50 hover:text-white"
          >
            {mode === "signin" ? "Нет аккаунта? Создать" : "Уже есть аккаунт? Войти"}
          </button>
        </div>
      </form>
    </div>
  );
}
