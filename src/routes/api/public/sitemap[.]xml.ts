import { createFileRoute } from "@tanstack/react-router";

const SITE = "https://aetheriapro.lovable.app";

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [{ loc: `${SITE}/`, priority: "1.0", changefreq: "weekly" }];
  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export const Route = createFileRoute("/api/public/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(buildSitemap(), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        }),
    },
  },
});
