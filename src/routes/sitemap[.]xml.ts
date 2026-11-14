import { createFileRoute } from "@tanstack/react-router";
import { FALLBACK_PROJECTS, slugify } from "@/lib/public-content";

const SITE = "https://aetheriapro.lovable.app";

function buildSitemap(names: string[]) {
  const urls = [
    { loc: `${SITE}/`, priority: "1.0", changefreq: "weekly" },
    ...names.map((n) => ({
      loc: `${SITE}/work/${slugify(n)}`,
      priority: "0.8",
      changefreq: "monthly",
    })),
  ];

  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const names = new Set(FALLBACK_PROJECTS.map((p) => p.name));
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (url && key) {
          const res = await fetch(`${url}/rest/v1/projects?select=name&published=eq.true`, { headers: { apikey: key } });
          if (!res.ok) return new Response("sitemap source error", { status: 500 });
          for (const r of (await res.json()) as { name: string }[]) names.add(r.name);
        }
        return new Response(buildSitemap([...names]), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});
