import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="dark relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-background px-6 text-center text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse at top, oklch(0.35 0.16 285 / 0.35) 0%, oklch(0.06 0.02 265) 65%)" }}
      />
      <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">Ошибка 404</div>
      <h1 className="font-display text-[22vw] leading-[0.85] text-white sm:text-[10rem]">404</h1>
      <p className="max-w-sm text-sm leading-relaxed text-white/55">
        Такой страницы нет — возможно, она ещё не создана или ссылка устарела.
      </p>
      <Link
        to="/"
        className="rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
      >
        Вернуться на главную
      </Link>
    </div>
  );
}


function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aetheria — Digital worlds that feel." },
      { name: "description", content: "Aetheria is a high-end digital studio crafting cinematic websites and immersive 3D experiences with AI and flawless performance." },
      { name: "author", content: "Aetheria Studio" },
      { name: "theme-color", content: "#05050a" },
      { property: "og:title", content: "Aetheria — Digital worlds that feel." },

      { property: "og:description", content: "Aetheria is a high-end digital studio crafting cinematic websites and immersive 3D experiences with AI and flawless performance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Aetheria — Digital worlds that feel." },
      { name: "twitter:description", content: "Aetheria is a high-end digital studio crafting cinematic websites and immersive 3D experiences with AI and flawless performance." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ceb83dae-1563-4946-af9a-f00f87ba836b/id-preview-29571296--6e7ec5be-a2e4-42c8-bb85-c9d1d2b71623.lovable.app-1780949296052.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ceb83dae-1563-4946-af9a-f00f87ba836b/id-preview-29571296--6e7ec5be-a2e4-42c8-bb85-c9d1d2b71623.lovable.app-1780949296052.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://qhbdfxtkyddgfedmbfsm.supabase.co" },
      { rel: "dns-prefetch", href: "https://qhbdfxtkyddgfedmbfsm.supabase.co" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster theme="dark" position="top-right" richColors />
    </QueryClientProvider>
  );
}
